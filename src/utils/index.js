/** 通用工具函数 */

/** 封面样式：支持渐变字符串 / 颜色 / 图片 URL */
export function coverStyle(cover) {
  const presets = [
    'linear-gradient(135deg, #49b1f5 0%, #9ac8e2 100%)',
    'linear-gradient(135deg, #ff7242 0%, #fcc8c8 100%)',
    'linear-gradient(135deg, #6f42c1 0%, #bba8ff 100%)',
    'linear-gradient(135deg, #00b96b 0%, #a8e6c1 100%)',
    'linear-gradient(135deg, #ffd166 0%, #ffe8a3 100%)',
    'linear-gradient(135deg, #f759ab 0%, #ffc2d4 100%)'
  ]
  const c = (cover || '').trim()
  if (!c) return { background: presets[Math.abs(hashCode(c || 'bf')) % presets.length] }
  if (c.startsWith('linear-gradient') || c.startsWith('#') || c.startsWith('rgb')) return { background: c }
  return { backgroundImage: `url("${c}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
}

export function hashCode(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return h
}

/** 阅读时长（按 400 字/分钟） */
export function readingTime(content = '') {
  const words = content.replace(/\s/g, '').length
  return Math.max(1, Math.round(words / 400))
}
