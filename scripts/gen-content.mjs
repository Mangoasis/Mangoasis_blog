/**
 * 生成 public/data/content.json（站点初始内容包）
 * 用法：node scripts/gen-content.mjs
 * 也可在「个人中心 → 导出全部数据」后，将导出的 JSON 中的 data 部分合并进来。
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { seedPosts, seedTalks, seedMessages, seedLinks } from '../src/data/seed.js'

const payload = {
  app: 'mangoasis',
  version: 1,
  exportedAt: new Date().toISOString(),
  data: {
    // 照片/资源为 null 时，访客端回退到内置演示数据
    'butterfly-blog-posts': seedPosts,
    'butterfly-blog-talks': seedTalks,
    'butterfly-blog-messages': seedMessages,
    'butterfly-blog-links': seedLinks,
    'butterfly-blog-photos': null,
    'butterfly-blog-resources': null
  }
}

mkdirSync('public/data', { recursive: true })
writeFileSync('public/data/content.json', JSON.stringify(payload, null, 2))
console.log('public/data/content.json generated')
