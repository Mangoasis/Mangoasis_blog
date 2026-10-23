<script setup>
import { computed } from 'vue'
import { MdPreview } from 'md-editor-v3'
import PageBanner from '../components/PageBanner.vue'
import AsideBox from '../components/AsideBox.vue'
import { siteStore } from '../stores/site'

const theme = computed(() => (siteStore.dark ? 'dark' : 'light'))

const content = computed(
  () => `## 🎈 关于本站

${siteStore.desc}

本站是一片安静的个人绿洲：视觉设计灵感来自 Hexo **Butterfly** 主题，
技术栈参考 [mrzym.top](http://mrzym.top/#/home)：**Vue3 + Element Plus + Vue Router（哈希模式）**，构建工具为 Vite，编辑器为 Vditor（类 Typora 即时渲染）。

## ✨ 特性一览

- 🦋 Butterfly 风格：顶部横幅、打字机副标题、卡片布局、侧边栏、暗黑模式
- ✍️ **网页端 + 移动端在线写作**：Markdown 编辑器、实时预览、草稿自动保存
- 🗂️ 分类 / 标签 / 归档 / 说说 / 留言板 / 友链
- 💾 数据保存在浏览器本地（localStorage），支持一键导入导出

## 🛠️ 技术栈

| 技术 | 说明 |
| ---- | ---- |
| Vue 3 | 组合式 API |
| Element Plus | 组件库 |
| md-editor-v3 | Markdown 编辑与渲染 |
| Vite | 开发与构建 |

## 📮 联系我

- 留言板：<a href="#/message">点这里</a>
- 邮箱：example@mail.com

> 感谢访问，欢迎常来！`
)
</script>

<template>
  <div>
    <PageBanner title="关于" :subtitle="siteStore.subtitle" />

    <div class="bf-container">
      <main class="bf-main">
        <div class="bf-card about-card" v-reveal>
          <MdPreview
            :model-value="content"
            :theme="theme"
            preview-theme="github"
            code-theme="github"
            class="bf-article-content"
            style="background: transparent"
          />
        </div>
      </main>
      <AsideBox />
    </div>
  </div>
</template>

<style scoped>
.about-card {
  padding: 28px 32px;
}

@media (max-width: 640px) {
  .about-card {
    padding: 18px 16px;
  }
}
</style>
