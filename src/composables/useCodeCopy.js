/**
 * 代码块一键复制：接管 md-editor-v3 的复制按钮
 * - 剪贴板 API 失败时降级为 execCommand（兼容更多环境）
 * - 复制成功/失败直接反馈在按钮上
 */
export function installCodeCopy() {
  document.addEventListener(
    'click',
    async (e) => {
      const btn = e.target.closest('.md-editor-copy-button')
      if (!btn) return
      // 接管点击，避免内置失败提示覆盖我们的结果
      e.stopPropagation()
      e.preventDefault()

      // 向上找到包含 code 的容器，取代码文本
      let holder = btn.parentElement
      let codeEl = null
      let hops = 0
      while (holder && hops < 5) {
        codeEl = holder.querySelector('code')
        if (codeEl) break
        holder = holder.parentElement
        hops++
      }
      const text = codeEl ? codeEl.innerText : ''
      const ok = await copyText(text)

      btn.textContent = ok ? '复制成功' : '复制失败'
      btn.classList.toggle('copy-ok', ok)
      setTimeout(() => {
        btn.textContent = '复制代码'
        btn.classList.remove('copy-ok')
      }, 1800)
    },
    true
  )
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (e) {
    // 降级方案：隐藏 textarea + execCommand
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
    document.body.appendChild(ta)
    ta.select()
    ta.setSelectionRange(0, text.length)
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch (err) {
      ok = false
    }
    document.body.removeChild(ta)
    return ok
  }
}
