# Mangoasis

基于 **Vue3 + Element Plus** 的个人博客与壁纸空间 **Mangoasis**，视觉设计灵感来自 [Hexo Butterfly 主题](https://butterfly.js.org/)，技术栈与功能参考 [mrzym.top](http://mrzym.top/#/home)，**支持网页端与移动端在线编写博客（类 Typora 即时渲染编辑器）**。

## ✨ 特性

- 🏞️ **壁纸论坛风格首页**（参照 haowallpaper.com/wallpaperForum）：你的壁纸（`public/img/wallpaper.jpg`，可自行替换）作为全屏固定背景，玻璃英雄区（头像光环/文楷站名/打字机副标题/行动按钮），下滑进入玻璃瀑布流「壁纸精选」（相册分组筛选 + 灯箱预览）与「最新文章」
- 🌊 **丝滑动效**：全站滚动显现动画（v-reveal 交错入场）、导航栏下滑自动隐藏/上滑浮现、返回顶部按钮带阅读进度环、路由切换顶部进度条、主题切换圆形扩散过渡（View Transition）、卡片悬停浮起 + 图片缩放
- ⌨️ **全局快捷搜索**：`Ctrl + K` 或 `/` 随时唤起，标题/摘要/标签/分类模糊搜索，↑↓ 选择、Enter 打开；导航栏与移动端悬浮球均有入口
- 🎛️ **个人中心**（`#/userCenter`）：在线编辑站点名称/副标题/描述/公告/头像/昵称/签名/社交链接，全量数据导出与恢复，危险区一键清空
- 🔤 **精致字体**：Noto Sans SC（界面）+ LXGW WenKai 霞鹜文楷（正文/站名）+ JetBrains Mono（代码），按 unicode-range 子集按需加载
- 🦋 **Butterfly 主题风格**：毛玻璃导航（药丸高亮）、卡片布局、侧边栏（公告/作者/博客信息/最新文章/分类/标签云）、页脚运行天数
- 🌙 **明暗双主题**：一键切换，md-editor-v3 联动渲染代码高亮，刷新后记忆；支持 `prefers-reduced-motion` 无障碍降级
- ✍️ **在线写作（核心功能）**：md-editor-v3 编辑器、桌面分屏预览、移动端工具栏/预览切换/底部抽屉设置、草稿自动保存、发布/转草稿/置顶、分类标签、封面、摘要、slug、我的文章管理、`.md` 导入导出、JSON 备份
- 📄 文章详情：阅读进度条、浏览量统计、macOS 风格代码块、宽屏悬浮目录、版权声明、打赏弹窗、上下篇导航
- 🖼️ 相册：分组筛选、灯箱预览、添加（链接/本地 base64）、删除 ｜ 🔗 资源收藏：分类 tab + 搜索，兼容 `/resources/front|back`
- 💬 说说（发布/点赞/评论/删除）、留言板（回复）、友链（申请）、关于、404
- 💾 数据保存在浏览器 `localStorage`，无需后端；Store 层已抽象，可无缝替换为 REST API

## 🚀 快速开始

```bash
npm install     # 安装依赖（需要 Node.js ≥ 18）
npm run dev     # 开发模式 → http://localhost:5173
npm run build   # 生产构建 → dist/
npm run preview # 本地预览生产构建
```

> `dist/` 为纯静态产物（哈希路由 `#/home`，资源相对路径 `base: './'`），可直接扔到任意静态服务器 / GitHub Pages / Vercel / Nginx。

## 📁 目录结构

```
Blog/
├── index.html                 # 入口 HTML
├── vite.config.js             # Vite 配置（base './'）
├── public/img/                # 头像 / logo / 壁纸 / 简笔画封面
└── src/
    ├── main.js                # 应用入口（Element Plus 全量注册 + 暗黑样式）
    ├── router/index.js        # 哈希路由（#/home，同 mrzym.top）
    ├── stores/
    │   ├── posts.js           # 文章 CRUD、分类/标签计算、导入导出（localStorage）
    │   ├── social.js          # 说说 / 留言 / 友链
    │   └── site.js            # 站点配置 + 明暗主题
    ├── data/seed.js           # 首次运行种子数据（3 篇示例文章 + 1 篇草稿）
    ├── styles/
    │   ├── butterfly.css      # Butterfly 设计系统（明暗双主题 CSS 变量）
    │   └── markdown.css       # 正文阅读样式
    ├── components/            # 导航栏 / 横幅 / 文章卡片 / 侧边栏 / 页脚 / 悬浮按钮
    └── views/                 # 首页 / 文章 / 归档 / 分类 / 标签 / 写作 / 说说 / 留言 / 友链 / 关于 / 404
```

## 🖊️ 写作指南

1. 点击导航栏「**写作**」按钮（或右下角 ✏️、移动端抽屉菜单）进入 `#/write`
2. 输入标题与正文，桌面端右侧实时预览；移动端通过工具栏「预览」按钮切换
3. 左侧（移动端为底部抽屉 `…` 按钮）设置分类、标签、封面、摘要
4. 内容每 1.5 秒自动保存为草稿；点击「**发布**」后文章立即出现在前台
5. 通过「**我的文章**」继续编辑草稿、导出 `.md`、删除或转为草稿
6. 定期点「**备份**」导出全部文章 JSON；换设备时通过「**导入**」恢复

## 🗄️ 数据说明

| localStorage 键 | 内容 |
| ---- | ---- |
| `butterfly-blog-posts` | 全部文章（含草稿） |
| `butterfly-blog-talks` / `messages` / `links` | 说说 / 留言 / 友链 |
| `butterfly-blog-theme` | 明暗主题记忆 |

清除浏览器数据会丢失文章，请善用「备份」导出。需要多端同步时，将 `src/stores/posts.js` 中的持久化函数替换为后端 API 即可（数据结构已按前后端分离设计）。

## 🖼️ 横幅与图片

- **首页壁纸**：`public/img/wallpaper.jpg`（全屏固定背景）。想换壁纸直接替换该文件即可
- 打赏收款码：放入 `public/img/reward-wechat.png` / `reward-alipay.png` 即生效
- 相册页照片：支持外链或本地图片（≤1.5MB，以 base64 存入浏览器）

## ⌨️ 快捷键与账号

| 快捷键 / 账号 | 说明 |
| ---- | ---- |
| `Ctrl / ⌘ + K` 或 `/` | 全局搜索文章（↑↓ 选择，Enter 打开） |
| 右下角 🌙 / ☀️ | 明暗主题切换（圆形扩散过渡） |
| 账号 `mangoasis` / 密码 `mangoasis1210` | 站长登录（写作、上传照片、个人中心需登录） |

> 登录凭据在 `src/stores/auth.js` 中修改。勾选「7 天内免登录」持久化到 localStorage，否则仅当前浏览器会话有效。

## 🧭 导航结构

- 主导航：首页 / 文章 / 时间线（原归档）/ 分类 / 标签 / 关于
- **更多**折叠：说说 / 相册 / 留言板 / 友链 / 资源
- 菜单图标逐一配色，hover 弹跳动效，移动端抽屉全量平铺

## 🛠️ 技术栈

| 技术 | 用途 |
| ---- | ---- |
| Vue 3.5 | 组合式 API |
| Element Plus 2.8 | 组件库（抽屉/选择器/消息/确认框/灯箱…） |
| Vue Router 4 | 哈希模式路由 |
| md-editor-v3 5 | Markdown 编辑器 + 预览渲染 + 目录 |
| @fontsource | Noto Sans SC / LXGW WenKai / JetBrains Mono 字体 |
| Vite 6 | 开发与构建 |
