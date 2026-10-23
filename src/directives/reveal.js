/**
 * v-reveal 滚动显现指令
 * 用法：v-reveal 或 v-reveal="120"（延迟毫秒，用于 v-for 交错动画）
 * 元素初始隐藏，进入视口时以弹性曲线淡入上移
 */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let observer = null

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-in')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.06, rootMargin: '0px 0px -24px 0px' }
    )
  }
  return observer
}

export const reveal = {
  mounted(el, binding) {
    const delay = typeof binding.value === 'number' ? binding.value : 0
    el.style.setProperty('--reveal-delay', Math.min(delay, 480) + 'ms')

    // 无障碍：用户偏好减少动画时直接显示
    if (prefersReduced || !('IntersectionObserver' in window)) return

    el.classList.add('reveal-init')
    getObserver().observe(el)
  },
  unmounted(el) {
    if (observer) observer.unobserve(el)
  }
}

export function installReveal(app) {
  app.directive('reveal', reveal)
}
