import { reactive } from 'vue'
import { seedTalks, seedMessages, seedLinks } from '../data/seed'

function createLocalStore(key, seed) {
  function load() {
    try {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw)
    } catch (e) {
      /* ignore */
    }
    return null
  }
  const state = reactive(load() || seed)
  const persist = () => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch (e) {
      console.warn('[Mangoasis] 数据保存失败（存储空间不足或被禁用）', e)
    }
  }
  const genId = () => key[0] + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
  const now = () => {
    const d = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  return { state, persist, genId, now }
}

/* ---------- 说说 ---------- */
const talkStore = createLocalStore('butterfly-blog-talks', seedTalks)

export const talks = talkStore.state

/** 发布随笔：可附带配图（data URL 或图片链接数组） */
export function addTalk(content, images = []) {
  talks.unshift({
    id: talkStore.genId(),
    date: talkStore.now(),
    content,
    images: Array.isArray(images) ? images.filter(Boolean) : [],
    likes: 0,
    comments: []
  })
  talkStore.persist()
}

export function likeTalk(id) {
  const t = talks.find((t) => t.id === id)
  if (t) {
    t.likes++
    talkStore.persist()
  }
}

export function commentTalk(id, name, content) {
  const t = talks.find((t) => t.id === id)
  if (t) {
    t.comments.push({ name, content, date: talkStore.now() })
    talkStore.persist()
  }
}

export function deleteTalk(id) {
  const i = talks.findIndex((t) => t.id === id)
  if (i > -1) {
    talks.splice(i, 1)
    talkStore.persist()
  }
}

/* ---------- 留言板 ---------- */
const msgStore = createLocalStore('butterfly-blog-messages', seedMessages)

export const messages = msgStore.state

export function addMessage(name, content) {
  messages.unshift({ id: msgStore.genId(), name, avatar: '', date: msgStore.now(), content, replies: [] })
  msgStore.persist()
}

export function replyMessage(id, name, content) {
  const m = messages.find((m) => m.id === id)
  if (m) {
    m.replies.push({ name, avatar: '', date: msgStore.now(), content })
    msgStore.persist()
  }
}

/* ---------- 友链 ---------- */
const linkStore = createLocalStore('butterfly-blog-links', seedLinks)

export const links = linkStore.state

export function addLink(link) {
  links.push({ ...link, id: linkStore.genId() })
  linkStore.persist()
}
