import { ui } from '../stores/ui'

/**
 * J / K 键盘阅读导航：
 * - J 向下滚动一屏（80%），K 向上滚动，支持长按连续滚动
 * - 输入框 / 富文本 / 快捷搜索打开时忽略
 */
export function installKeyboardNav() {
  let repeating = null

  function isTyping(e) {
    const t = e.target
    return (
      ui.searchOpen ||
      (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable || t.tagName === 'SELECT'))
    )
  }

  function scrollStep(dir) {
    window.scrollBy({ top: dir * window.innerHeight * 0.8, behavior: 'smooth' })
  }

  window.addEventListener(
    'keydown',
    (e) => {
      if (isTyping(e) || e.ctrlKey || e.metaKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (k !== 'j' && k !== 'k') return

      e.preventDefault()
      const dir = k === 'j' ? 1 : -1
      scrollStep(dir)
      // 长按连续滚动（延迟后每 260ms 一步，松开停止）
      clearTimeout(repeating)
      repeating = setTimeout(() => {
        repeating = setInterval(() => scrollStep(dir), 260)
      }, 420)
    },
    { passive: false }
  )

  window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase()
    if (k === 'j' || k === 'k') {
      clearTimeout(repeating)
      clearInterval(repeating)
      repeating = null
    }
  })
}
