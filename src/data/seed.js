/**
 * 首次运行时的种子数据
 */

export const seedPosts = [
  {
    id: 'welcome',
    title: '欢迎来到 Mangoasis',
    slug: 'hello-mangoasis',
    date: '2026-10-20 10:00',
    updated: '2026-10-20 10:00',
    category: '公告',
    tags: ['博客', '公告'],
    cover: './img/covers/sunny.svg',
    summary:
      '欢迎来到 Mangoasis！一片基于 Vue3 + Element Plus 打造的个人绿洲：视觉源自 Hexo Butterfly 主题，支持网页端与移动端在线编写文章。',
    content: `欢迎来到 **Mangoasis**！🥭

本站是一片安静的个人绿洲：视觉设计源自 Hexo **Butterfly 主题**，使用 [mrzym.top](http://mrzym.top/#/home) 同款技术栈 **Vue3 + Element Plus** 构建，前后端分离、数据本地化。

## ✨ 特性

- 🖼️ 壁纸论坛风格首页：全屏壁纸 + 玻璃拟态瀑布流
- ✍️ **在线编写博客**：Markdown 编辑器 + 实时预览，网页端与移动端均可写作
- 📦 数据本地持久化：文章保存在浏览器 localStorage，支持导出备份
- 🏷️ 分类 / 标签 / 时间线 / 随笔 / 留言板 / 友链 / 相册 / 资源一应俱全

## 🖊️ 立即开始写作

点击导航栏的「**写作**」或右下角的编辑按钮，即可进入编写页面：

1. 填写标题、分类、标签等元信息
2. 使用 Markdown 编写正文，右侧实时预览
3. 支持保存草稿与正式发布
4. 手机上同样可以写作，编辑 / 预览一键切换

## 📤 数据安全

所有数据保存在当前浏览器中，建议定期使用「导出全部」按钮备份为 JSON 文件，或为单篇文章导出 \`.md\` 文件。

> 在 Mangoasis 享受记录的乐趣吧！`,
    status: 'published',
    top: true
  },
  {
    id: 'markdown-guide',
    title: 'Markdown 写作指南',
    slug: 'markdown-guide',
    date: '2026-10-18 20:30',
    updated: '2026-10-18 20:30',
    category: '教程',
    tags: ['Markdown', '教程', '写作'],
    cover: './img/covers/coffee.svg',
    summary:
      '一篇覆盖常用语法的 Markdown 示例文章：标题、列表、表格、代码块、引用、数学公式等，可作为写作时的速查手册。',
    content: `Markdown 是一种轻量级标记语言，让你专注内容而非排版。本文演示常用语法。

## 标题

使用 \`#\` 到 \`######\` 表示一到六级标题。

## 文字样式

**粗体**、*斜体*、~~删除线~~、\`行内代码\`，以及 [链接](https://vuejs.org)。

## 列表

无序列表：

- Vue 3
- Element Plus
- Vite

有序列表：

1. 打开写作页面
2. 输入内容
3. 点击发布

## 引用

> 这是一段引用文字。
> —— 某位智者

## 代码块

\`\`\`js
import { createApp } from 'vue'
import ElementPlus from 'element-plus'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
\`\`\`

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

print(greet("Butterfly"))
\`\`\`

## 表格

| 语法 | 效果 | 快捷键 |
| ---- | ---- | ------ |
| \`**粗体**\` | **粗体** | Ctrl + B |
| \`*斜体*\` | *斜体* | Ctrl + I |
| \`~~删除~~\` | ~~删除~~ | - |

## 图片

\`\`\`
![图片描述](https://example.com/image.png)
\`\`\`

## 分割线

---

更多语法可参考 [Markdown 官方教程](https://markdown.com.cn)。`,
    status: 'published',
    top: false
  },
  {
    id: 'vue3-stack',
    title: '本站技术栈说明：Vue3 + Element Plus',
    slug: 'vue3-element-plus-stack',
    date: '2026-10-15 14:20',
    updated: '2026-10-15 14:20',
    category: '技术',
    tags: ['Vue3', 'Element Plus', '前端'],
    cover: './img/covers/moon.svg',
    summary:
      '本站参考 mrzym.top 采用前后端分离架构：Vue3 组合式 API + Element Plus 组件库 + Vue Router 哈希路由 + md-editor-v3 编辑器，本文介绍各部分的作用。',
    content: `本站技术栈与 [mrzym.top](http://mrzym.top/#/home) 保持一致，整体架构如下。

## 核心依赖

| 依赖 | 用途 |
| ---- | ---- |
| Vue 3 | 渐进式前端框架，采用组合式 API |
| Element Plus | 基于 Vue 3 的组件库，提供按钮、抽屉、消息等组件 |
| Vue Router 4 | 哈希模式路由（\`#/home\`），便于静态部署 |
| md-editor-v3 | Markdown 编辑器与预览渲染，支持代码高亮与目录 |

## 构建工具

使用 **Vite** 进行开发与构建：

\`\`\`bash
npm install     # 安装依赖
npm run dev     # 启动开发服务器
npm run build   # 生产构建
\`\`\`

## 数据层

当前版本数据保存在浏览器 \`localStorage\`，通过响应式 Store 管理：

\`\`\`js
const posts = reactive(loadFromStorage() || seedPosts)

function save(post) {
  const index = posts.findIndex((p) => p.id === post.id)
  if (index > -1) posts[index] = post
  else posts.unshift(post)
  persist()
}
\`\`\`

后续可将 Store 替换为 REST API 调用，无缝接入真实后端。

## 响应式适配

- 桌面端：内容区 + 侧边栏双栏布局，文章页含目录
- 移动端：抽屉式导航，单栏布局，写作页编辑 / 预览切换`,
    status: 'published',
    top: false
  },
  {
    id: 'draft-todo',
    title: '【草稿】待完成的计划清单',
    slug: 'todo-list',
    date: '2026-10-22 08:00',
    updated: '2026-10-22 08:00',
    category: '生活',
    tags: ['计划'],
    cover: './img/covers/balloon.svg',
    summary: '这是一篇未发布的草稿示例，演示草稿状态的文章不会出现在首页，但可以在写作页继续编辑。',
    content: `这是一篇**草稿**文章，用于演示：

- 草稿文章不会展示在首页 / 列表 / 归档中
- 可在「写作」页面通过「我的文章」找到并继续编辑
- 点击「发布」后即可公开

## 待办

- [ ] 学会 Vue3 组合式 API
- [ ] 读完《 JavaScript 高级程序设计》
- [ ] 每周写一篇博客
- [ ] 给博客换一个好看的封面`,
    status: 'draft',
    top: false
  }
]

export const seedTalks = [
  {
    id: 't1',
    date: '2026-10-23 21:30',
    content:
      '博客搭建完成啦🎉 从 Butterfly 主题移植视觉，用 Vue3 + Element Plus 重写，还加上了在线写作功能，手机上也能发文章了！',
    likes: 6,
    comments: []
  },
  {
    id: 't2',
    date: '2026-10-21 09:12',
    content: '今天天气很好，出门拍了几张照片，心情不错 ☀️',
    likes: 3,
    comments: [{ name: '访客', content: '求照片！' }]
  }
]

export const seedMessages = [
  {
    id: 'm1',
    name: '小明',
    avatar: '',
    date: '2026-10-22 18:40',
    content: '博主博客真好看，请问暗黑模式怎么开的？',
    replies: [
      {
        name: '博主',
        avatar: '',
        date: '2026-10-22 19:00',
        content: '右下角的月亮图标，点一下就行啦~'
      }
    ]
  },
  {
    id: 'm2',
    name: '路过的游客',
    avatar: '',
    date: '2026-10-23 10:15',
    content: '页面很流畅，支持一下！期待更多教程 🎈',
    replies: []
  }
]

export const seedLinks = [
  {
    name: 'Butterfly 主题文档',
    desc: '本站视觉设计的来源，Hexo 最好看的主题之一',
    url: 'https://butterfly.js.org/',
    avatar: './img/butterfly-icon.png'
  },
  {
    name: 'mrzym.top',
    desc: '本站技术栈与功能参考：Vue3 + Element Plus 个人博客',
    url: 'http://mrzym.top/',
    avatar: 'https://vuejs.org/logo.svg'
  },
  {
    name: 'Vue 官方文档',
    desc: '渐进式 JavaScript 框架',
    url: 'https://cn.vuejs.org/',
    avatar: 'https://vuejs.org/logo.svg'
  },
  {
    name: 'Element Plus',
    desc: '基于 Vue 3，面向设计师和开发者的组件库',
    url: 'https://element-plus.org/zh-CN/',
    avatar: 'https://element-plus.org/images/element-plus-logo-small.svg'
  }
]
