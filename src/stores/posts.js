import { reactive, computed } from 'vue'
import { seedPosts } from '../data/seed'

const POSTS_KEY = 'butterfly-blog-posts'

/** 旧版演示文品牌迁移：欢迎文内容始终与最新种子同步（保留日期与浏览量） */
function migrateBrand(data) {
  if (!Array.isArray(data)) return data
  const w = data.find((p) => p.id === 'welcome')
  const seed = seedPosts.find((p) => p.id === 'welcome')
  if (w && seed && (w.title === '欢迎来到 Butterfly Blog' || w.slug === 'hello-butterfly' || w.title === '欢迎来到 Mangoasis')) {
    Object.assign(w, JSON.parse(JSON.stringify(seed)), {
      date: w.date,
      updated: w.updated,
      views: w.views || 0
    })
  }
  return data
}

function load() {
  try {
    const raw = localStorage.getItem(POSTS_KEY)
    if (raw) return migrateBrand(JSON.parse(raw))
  } catch (e) {
    /* ignore */
  }
  return null
}

/** 安全持久化：localStorage 满/禁用时仅警告，不中断应用 */
function persist() {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
  } catch (e) {
    console.warn('[Mangoasis] 文章保存失败（存储空间不足或被禁用）', e)
  }
}

export const posts = reactive(load() || seedPosts.map((p) => ({ ...p })))

function genId() {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function now() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 已发布文章（置顶优先，时间倒序） */
export const publishedPosts = computed(() =>
  posts
    .filter((p) => p.status === 'published')
    .sort((a, b) => {
      if (a.top !== b.top) return b.top - a.top
      return (b.date > a.date ? 1 : b.date < a.date ? -1 : 0)
    })
)

export const draftPosts = computed(() =>
  posts.filter((p) => p.status === 'draft').sort((a, b) => (b.updated > a.updated ? 1 : -1))
)

export function getPost(id) {
  return posts.find((p) => p.id === id)
}

/**
 * 新增或更新文章。data 需包含 title/content 等字段；
 * 返回保存后的文章对象。
 */
export function savePost(data) {
  let post = data.id ? getPost(data.id) : null
  const stamp = now()
  if (post) {
    Object.assign(post, data, { updated: stamp })
  } else {
    // 注意：id 必须放最后，防止 data.id（空字符串）覆盖生成的 id
    const { id: _drop, ...rest } = data
    post = {
      slug: '',
      date: stamp,
      updated: stamp,
      category: '未分类',
      tags: [],
      cover: '',
      summary: '',
      status: 'draft',
      top: false,
      ...rest,
      id: genId()
    }
    posts.unshift(post)
  }
  persist()
  return post
}

export function deletePost(id) {
  const i = posts.findIndex((p) => p.id === id)
  if (i > -1) {
    posts.splice(i, 1)
    persist()
    return true
  }
  return false
}

/** 浏览量 +1（同一浏览器会话内同一篇文章只计一次，避免刷新虚增） */
export function addView(id) {
  const p = getPost(id)
  if (!p) return
  try {
    const key = 'viewed-' + id
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  } catch (e) {
    /* ignore */
  }
  p.views = (p.views || 0) + 1
  persist()
}

/** 全部分类：[{ name, count }] */
export const categories = computed(() => {
  const map = new Map()
  for (const p of publishedPosts.value) {
    const c = p.category || '未分类'
    map.set(c, (map.get(c) || 0) + 1)
  }
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
})

/** 全部标签：[{ name, count }] */
export const tags = computed(() => {
  const map = new Map()
  for (const p of publishedPosts.value) {
    for (const t of p.tags || []) map.set(t, (map.get(t) || 0) + 1)
  }
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
})

export function postsByCategory(name) {
  return publishedPosts.value.filter((p) => (p.category || '未分类') === name)
}

export function postsByTag(name) {
  return publishedPosts.value.filter((p) => (p.tags || []).includes(name))
}

/** 相邻文章（基于已发布列表） */
export function neighborsOf(id) {
  const list = publishedPosts.value
  const i = list.findIndex((p) => p.id === id)
  return { prev: i > 0 ? list[i - 1] : null, next: i > -1 && i < list.length - 1 ? list[i + 1] : null }
}

/* ---------- 导入 / 导出 ---------- */

/** 导出全部文章为 JSON */
export function exportAll() {
  const blob = new Blob([JSON.stringify(posts, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `mangoasis-posts-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

/** 导入 JSON（合并，按 id 去重，新数据覆盖旧数据） */
export function importJson(text) {
  const data = JSON.parse(text)
  if (!Array.isArray(data)) throw new Error('文件格式错误：需要 JSON 数组')
  let added = 0
  let updated = 0
  for (const item of data) {
    if (!item || typeof item !== 'object' || !item.title) continue
    if (item.id && getPost(item.id)) {
      Object.assign(getPost(item.id), item)
      updated++
    } else {
      posts.unshift({ status: 'draft', top: false, tags: [], category: '未分类', ...item, id: item.id || genId() })
      added++
    }
  }
  persist()
  return { added, updated }
}

/**
 * 解析带 frontmatter 的 Markdown 文本
 * ---
 * title: xxx
 * category: xxx
 * tags: [a, b]
 * date: 2026-01-01 10:00
 * ---
 * 正文...
 */
export function parseMarkdownFile(text, filename) {
  let meta = {}
  let content = text
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (m) {
    content = text.slice(m[0].length)
    for (const line of m[1].split(/\r?\n/)) {
      const kv = line.match(/^(\w+):\s*(.*)$/)
      if (!kv) continue
      const [, key, raw] = kv
      let value = raw.trim()
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
      } else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1)
      }
      meta[key] = value
    }
  }
  return {
    id: undefined,
    title: meta.title || (filename || '未命名文章').replace(/\.md$/i, ''),
    slug: meta.slug || '',
    date: meta.date || now(),
    updated: now(),
    category: meta.category || '未分类',
    tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [],
    cover: meta.cover || '',
    summary: content.replace(/[#>*`\-\[\]()!]/g, '').replace(/\s+/g, ' ').trim().slice(0, 100),
    content,
    status: 'draft',
    top: false
  }
}

/** 导出单篇文章为 .md（带 frontmatter） */
export function exportMarkdown(post) {
  const fm = [
    '---',
    `title: ${post.title}`,
    `slug: ${post.slug || ''}`,
    `date: ${post.date}`,
    `category: ${post.category || '未分类'}`,
    `tags: [${(post.tags || []).join(', ')}]`,
    post.cover ? `cover: ${post.cover}` : null,
    `status: ${post.status}`,
    '---'
  ]
    .filter(Boolean)
    .join('\n')
  const blob = new Blob(['\ufeff' + fm + '\n\n' + post.content], { type: 'text/markdown;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${(post.slug || post.title).replace(/[\\/:*?"<>|]/g, '_')}.md`
  a.click()
  URL.revokeObjectURL(a.href)
}
