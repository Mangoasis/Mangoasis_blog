import { reactive, watch } from 'vue'

/**
 * 站点全局配置与主题模式（Butterfly 风格）
 */
export const siteStore = reactive({
  title: 'Mangoasis',
  subtitle: '一片静谧的芒果绿洲',
  desc: '你好，欢迎来到 Mangoasis！这里记录我的学习、生活与思考。',
  /** 站点 logo（导航栏 / 登录页品牌位） */
  logo: './img/logo.svg',
  announcement:
    '欢迎来到 Mangoasis！✨ 你可以在网页端和手机端直接在线写作，右侧「写作」按钮立即体验。如果喜欢本站，欢迎在留言板留下足迹～',
  reward: {
    enable: true,
    wechat: './img/reward-wechat.png',
    alipay: './img/reward-alipay.png'
  },
  author: {
    name: 'Mangoasis',
    avatar: './img/avatar.jpg',
    motto: '你也可以做生活的主人phphph~',
    social: [
      { icon: 'Compass', link: 'https://github.com' },
      { icon: 'ChatDotRound', link: '#/message' },
      { icon: 'Message', link: 'mailto:example@mail.com' }
    ]
  },
  // 建站年份：用于页脚版权区间
  since: '2026-01-01',
  dark: false
})

const THEME_KEY = 'butterfly-blog-theme'

const systemDark = window.matchMedia('(prefers-color-scheme: dark)')

siteStore.initTheme = function () {
  const saved = localStorage.getItem(THEME_KEY)
  // 未手动选择过主题时，跟随系统
  siteStore.dark = saved ? saved === 'dark' : systemDark.matches
  applyTheme()

  // 用户未手动选择时，系统切换主题实时跟随
  try {
    systemDark.addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        siteStore.dark = e.matches
        applyTheme()
      }
    })
  } catch (e) {
    /* 旧浏览器忽略 */
  }
}

function applyTheme() {
  document.documentElement.classList.toggle('dark', siteStore.dark)
}

/** 主题切换：支持 View Transition 圆形扩散动画（从点击位置展开） */
export function toggleDark(event) {
  if (event && typeof event.clientX === 'number' && event.clientX > 0) {
    toggleDark.coords = { x: event.clientX, y: event.clientY }
  }
  const { x, y } = toggleDark.coords || { x: window.innerWidth / 2, y: window.innerHeight / 2 }

  const apply = () => {
    siteStore.dark = !siteStore.dark
    localStorage.setItem(THEME_KEY, siteStore.dark ? 'dark' : 'light')
    applyTheme()
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!reduced && typeof document.startViewTransition === 'function') {
    const vt = document.startViewTransition(apply)
    vt.ready
      .then(() => {
        const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 550, easing: 'cubic-bezier(.4, 0, .2, 1)', pseudoElement: '::view-transition-new(root)' }
        )
      })
      .catch(() => {})
  } else {
    apply()
  }
}

toggleDark.coords = null

watch(
  () => ({
    title: siteStore.title,
    subtitle: siteStore.subtitle,
    desc: siteStore.desc,
    author: siteStore.author
  }),
  () => {
    localStorage.setItem('butterfly-blog-site', JSON.stringify({
      title: siteStore.title,
      subtitle: siteStore.subtitle,
      desc: siteStore.desc,
      author: siteStore.author
    }))
  },
  { deep: true }
)
