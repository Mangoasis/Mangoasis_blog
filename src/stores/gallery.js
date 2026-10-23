import { reactive, computed } from 'vue'

/* ---------- 相册（参照 mrzym.top /photoAlbum） ---------- */

/** 生成渐变艺术封面（SVG data URI，离线可用） */
function art(c1, c2, label) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='440'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient></defs><rect width='640' height='440' fill='url(#g)'/><circle cx='500' cy='80' r='150' fill='rgba(255,255,255,0.10)'/><circle cx='110' cy='360' r='110' fill='rgba(255,255,255,0.09)'/><text x='50%' y='53%' font-size='44' text-anchor='middle' fill='rgba(255,255,255,0.92)' font-family='sans-serif'>${label}</text></svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

const seedPhotos = [
  { id: 'ph1', album: '风景', src: art('#49b1f5', '#a1c4fd', '晴空'), title: '晴空', desc: '抬头就是好天气，蓝天配白云。', date: '2026-10-01' },
  { id: 'ph2', album: '风景', src: art('#f759ab', '#ffd6e7', '晚霞'), title: '晚霞', desc: '下班路上随手拍的粉色天空。', date: '2026-10-02' },
  { id: 'ph3', album: '风景', src: art('#6f42c1', '#c5a3ff', '夜色'), title: '夜色', desc: '城市入睡前的最后一盏灯。', date: '2026-09-28' },
  { id: 'ph4', album: '风景', src: art('#ffd166', '#fff3c4', '日落'), title: '日落', desc: '太阳落山的十分钟最温柔。', date: '2026-09-20' },
  { id: 'ph5', album: '生活', src: art('#00b96b', '#a8f0cd', '绿意'), title: '绿意', desc: '阳台上的小植物长得很好。', date: '2026-10-10' },
  { id: 'ph6', album: '生活', src: art('#ff7242', '#ffd3c2', '午后'), title: '午后', desc: '一杯咖啡，一下午的慢时光。', date: '2026-10-12' },
  { id: 'ph7', album: '生活', src: art('#17c2e5', '#c2f5ff', '海边'), title: '海边', desc: '海风吹走了一整周的疲惫。', date: '2026-09-15' },
  { id: 'ph8', album: '日常', src: art('#8d99ae', '#edf2f4', '灰调'), title: '灰调', desc: '喜欢这种安静的色调。', date: '2026-10-05' },
  { id: 'ph9', album: '日常', src: art('#f94144', '#ffd7d8', '热烈'), title: '热烈', desc: '生活需要一点热烈的颜色。', date: '2026-08-30' }
]

const photoStore = (() => {
  const KEY = 'butterfly-blog-photos'
  function load() {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const stored = JSON.parse(raw)
        // 旧数据迁移：为缺少描述的种子照片补上描述
        if (Array.isArray(stored)) {
          for (const p of stored) {
            if (p.desc === undefined) {
              const seed = seedPhotos.find((s) => s.id === p.id)
              p.desc = seed ? seed.desc : ''
            }
          }
        }
        return stored
      }
    } catch (e) {
      /* ignore */
    }
    return null
  }
  const state = reactive(load() || seedPhotos)
  const persist = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch (e) {
      console.warn('[Mangoasis] 照片保存失败（存储空间不足，请清理部分图片）', e)
    }
  }
  return { state, persist }
})()

export const photos = photoStore.state

export const albums = computed(() => {
  const map = new Map()
  for (const p of photos) map.set(p.album, (map.get(p.album) || 0) + 1)
  return [{ name: '全部', count: photos.length }, ...[...map.entries()].map(([name, count]) => ({ name, count }))]
})

export function photosOf(album) {
  return album === '全部' ? photos : photos.filter((p) => p.album === album)
}

export function addPhoto({ album, src, title, desc }) {
  photos.unshift({
    id: 'ph' + Date.now().toString(36),
    album,
    src,
    title: title || '未命名',
    desc: (desc || '').trim(),
    date: new Date().toISOString().slice(0, 10)
  })
  photoStore.persist()
}

export function deletePhoto(id) {
  const i = photos.findIndex((p) => p.id === id)
  if (i > -1) {
    photos.splice(i, 1)
    photoStore.persist()
  }
}

/** 本地图片文件 → base64（写入 localStorage，注意 5MB 容量限制） */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/* ---------- 资源收藏（参照 mrzym.top /resources） ---------- */

const seedResources = [
  { id: 'r1', name: 'Vue 3 官方文档', desc: '渐进式 JavaScript 框架，本站核心技术栈', url: 'https://cn.vuejs.org/', cat: '前端' },
  { id: 'r2', name: 'Element Plus', desc: '基于 Vue 3 的组件库，本站 UI 组件来源', url: 'https://element-plus.org/zh-CN/', cat: '前端' },
  { id: 'r3', name: 'Vite', desc: '下一代前端构建工具，快如闪电', url: 'https://cn.vitejs.dev/', cat: '前端' },
  { id: 'r4', name: 'MDN Web Docs', desc: 'Web 技术权威文档', url: 'https://developer.mozilla.org/zh-CN/', cat: '前端' },
  { id: 'r5', name: 'Node.js', desc: 'JavaScript 运行时', url: 'https://nodejs.org/zh-cn', cat: '后端' },
  { id: 'r6', name: 'Express', desc: '简洁灵活的 Node.js Web 框架', url: 'https://expressjs.com/', cat: '后端' },
  { id: 'r7', name: 'MySQL', desc: '最受欢迎的开源关系型数据库', url: 'https://www.mysql.com/', cat: '后端' },
  { id: 'r8', name: 'Redis', desc: '高性能内存数据库', url: 'https://redis.io/', cat: '后端' },
  { id: 'r9', name: 'Butterfly 主题文档', desc: '本站视觉设计来源', url: 'https://butterfly.js.org/', cat: '工具' },
  { id: 'r10', name: 'Can I Use', desc: '浏览器兼容性查询', url: 'https://caniuse.com/', cat: '工具' },
  { id: 'r11', name: 'TinyPNG', desc: '在线图片压缩', url: 'https://tinypng.com/', cat: '工具' },
  { id: 'r12', name: '掘金', desc: '高质量技术社区', url: 'https://juejin.cn/', cat: '学习' },
  { id: 'r13', name: 'GitHub', desc: '全球最大代码托管平台', url: 'https://github.com/', cat: '学习' },
  { id: 'r14', name: 'Stack Overflow', desc: '程序员问答社区', url: 'https://stackoverflow.com/', cat: '学习' }
]

export const resourceCats = ['全部', '前端', '后端', '工具', '学习']

const resourceStore = (() => {
  const KEY = 'butterfly-blog-resources'
  function load() {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) return JSON.parse(raw)
    } catch (e) {
      /* ignore */
    }
    return null
  }
  const state = reactive(load() || seedResources)
  const persist = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch (e) {
      console.warn('[Mangoasis] 资源保存失败（存储空间不足或被禁用）', e)
    }
  }
  return { state, persist }
})()

export const resources = resourceStore.state

export function addResource({ name, desc, url, cat }) {
  resources.unshift({ id: 'r' + Date.now().toString(36), name, desc, url, cat: cat || '工具' })
  resourceStore.persist()
}

export function deleteResource(id) {
  const i = resources.findIndex((r) => r.id === id)
  if (i > -1) {
    resources.splice(i, 1)
    resourceStore.persist()
  }
}
