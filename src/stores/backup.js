/**
 * 全量数据备份：文章 / 说说 / 留言 / 友链 / 相册 / 资源
 */

const KEYS = [
  'butterfly-blog-posts',
  'butterfly-blog-talks',
  'butterfly-blog-messages',
  'butterfly-blog-links',
  'butterfly-blog-photos',
  'butterfly-blog-resources'
]

const LABELS = {
  'butterfly-blog-posts': '文章',
  'butterfly-blog-talks': '说说',
  'butterfly-blog-messages': '留言',
  'butterfly-blog-links': '友链',
  'butterfly-blog-photos': '照片',
  'butterfly-blog-resources': '资源'
}

/** 导出全部数据为 JSON 文件 */
export function exportAllData() {
  const payload = { app: 'mangoasis', version: 1, exportedAt: new Date().toISOString(), data: {} }
  let total = 0
  for (const key of KEYS) {
    try {
      const raw = localStorage.getItem(key)
      const val = raw ? JSON.parse(raw) : null
      payload.data[key] = val
      if (Array.isArray(val)) total += val.length
    } catch (e) {
      payload.data[key] = null
    }
  }
  payload.totalItems = total
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `mangoasis-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
  return total
}

/**
 * 导入全量备份（覆盖式恢复）
 * 返回 { restored: [{label, count}] }，导入后需刷新页面使 Store 重新加载
 */
export function importAllData(text) {
  const payload = JSON.parse(text)
  const data = payload && payload.data ? payload.data : payload
  if (!data || typeof data !== 'object') throw new Error('备份文件格式不正确')
  const restored = []
  for (const key of KEYS) {
    const val = data[key]
    if (Array.isArray(val)) {
      localStorage.setItem(key, JSON.stringify(val))
      restored.push({ label: LABELS[key], count: val.length })
    }
  }
  if (!restored.length) throw new Error('备份文件中未找到任何可恢复的数据')
  return { restored }
}

import { posts as postsStore } from './posts'
import { talks, messages, links } from './social'
import { photos, resources } from './gallery'

/**
 * 首次访问（本地无数据）时，从仓库 public/data/content.json 加载站长发布的内容。
 * 站长更新内容流程：本地写作 → 个人中心「导出全部数据」→ 覆盖 public/data/content.json → 提交推送。
 */
export async function hydrateFromRepo() {
  try {
    if (localStorage.getItem('butterfly-blog-posts')) return false
    const res = await fetch('./data/content.json', { cache: 'no-cache' })
    if (!res.ok) return false
    const payload = await res.json()
    const data = payload && payload.data ? payload.data : payload
    const stores = {
      'butterfly-blog-posts': postsStore,
      'butterfly-blog-talks': talks,
      'butterfly-blog-messages': messages,
      'butterfly-blog-links': links,
      'butterfly-blog-photos': photos,
      'butterfly-blog-resources': resources
    }
    let filled = 0
    for (const [key, store] of Object.entries(stores)) {
      const val = data[key]
      if (Array.isArray(val)) {
        store.splice(0, store.length, ...val)
        localStorage.setItem(key, JSON.stringify(val))
        filled++
      }
    }
    return filled > 0
  } catch (e) {
    return false
  }
}

/** 清空指定数据（key 数组），不包含主题设置 */
export function clearData(keys) {
  for (const key of keys) localStorage.removeItem(key)
}

export const ALL_DATA_KEYS = KEYS
