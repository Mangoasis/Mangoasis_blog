<script setup>
import { computed } from 'vue'
import PageBanner from '../components/PageBanner.vue'
import AsideBox from '../components/AsideBox.vue'
import { categories, publishedPosts } from '../stores/posts'

const totalPosts = computed(() => publishedPosts.value.length)

/** 每个分类：图标渐变 + 最近 3 篇文章预览 */
const showcases = computed(() =>
  categories.value.map((c, i) => ({
    ...c,
    posts: publishedPosts.value.filter((p) => (p.category || '未分类') === c.name).slice(0, 3),
    gradient: [
      'linear-gradient(135deg, #49b1f5, #82c8f8)',
      'linear-gradient(135deg, #ff9f43, #ffcb80)',
      'linear-gradient(135deg, #6f42c1, #a78bfa)',
      'linear-gradient(135deg, #00b96b, #7fe0b0)',
      'linear-gradient(135deg, #f759ab, #ffa3cd)',
      'linear-gradient(135deg, #17c2e5, #8ae2f5)'
    ][i % 6]
  }))
)
</script>

<template>
  <div>
    <PageBanner title="分类" subtitle="按主题浏览文章" />

    <div class="bf-container">
      <main class="bf-main">
        <div class="cat-summary glass" v-reveal>
          <el-icon :size="18"><Collection /></el-icon>
          共 <b>{{ categories.length }}</b> 个分类 · <b>{{ totalPosts }}</b> 篇文章
        </div>

        <div class="cat-grid">
          <div
            v-for="(c, i) in showcases"
            :key="c.name"
            class="bf-card cat-showcase"
            v-reveal="(i % 4) * 70"
          >
            <div class="cs-head">
              <span class="cs-icon" :style="{ background: c.gradient }">
                <el-icon :size="19"><Collection /></el-icon>
              </span>
              <div class="cs-title">
                <span class="cs-name">{{ c.name }}</span>
                <span class="cs-count">{{ c.count }} 篇文章</span>
              </div>
              <router-link class="cs-all" :to="`/categories/${c.name}`" title="查看全部分类文章">
                <el-icon><ArrowRight /></el-icon>
              </router-link>
            </div>

            <ul class="cs-list">
              <li v-for="p in c.posts" :key="p.id">
                <router-link class="cs-post" :to="`/article/${p.id}`">
                  <span class="cs-post-title">{{ p.title }}</span>
                  <span class="cs-date">{{ p.date.slice(5, 10) }}</span>
                </router-link>
              </li>
            </ul>
            <div v-if="!c.posts.length" class="cs-empty">暂无文章</div>

            <router-link class="cs-more" :to="`/categories/${c.name}`">
              查看该分类全部文章
              <el-icon :size="13"><ArrowRight /></el-icon>
            </router-link>
          </div>
        </div>

        <el-empty v-if="!categories.length" description="还没有分类，发布文章时填写分类即可创建" />
      </main>
      <AsideBox />
    </div>
  </div>
</template>

<style scoped>
.cat-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 13px 18px;
  border-radius: var(--bf-radius-lg);
  margin-bottom: 20px;
  font-size: 14px;
  color: var(--bf-text-sub);
}

.cat-summary b {
  color: var(--bf-primary);
  font-size: 16px;
  margin: 0 2px;
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 900px) {
  .cat-grid {
    grid-template-columns: 1fr;
  }
}

.cat-showcase {
  padding: 20px 22px 16px;
  display: flex;
  flex-direction: column;
}

.cs-head {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 14px;
}

.cs-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cat-showcase:hover .cs-icon {
  transform: rotate(-8deg) scale(1.08);
}

.cs-title {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cs-name {
  font-size: 16.5px;
  font-weight: 700;
  color: var(--bf-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cs-count {
  font-size: 12.5px;
  color: var(--bf-text-sub);
}

.cs-all {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bf-text-sub);
  background: var(--bf-tag-bg);
  transition: all 0.22s;
}

.cs-all:hover {
  background: var(--bf-primary);
  color: #fff;
  transform: translateX(2px);
}

.cs-list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
}

.cs-list li {
  border-bottom: 1px dashed var(--bf-card-border);
}

.cs-list li:last-child {
  border-bottom: none;
}

.cs-post {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 2px;
  transition: transform 0.2s;
}

.cs-post:hover {
  transform: translateX(4px);
}

.cs-post-title {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  color: var(--bf-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.cs-post:hover .cs-post-title {
  color: var(--bf-hover);
}

.cs-date {
  font-size: 12px;
  color: var(--bf-text-light);
  font-variant-numeric: tabular-nums;
}

.cs-empty {
  padding: 16px 2px;
  font-size: 13px;
  color: var(--bf-text-light);
}

.cs-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 12px;
  padding: 8px;
  border-radius: 8px;
  font-size: 13px;
  color: var(--bf-primary);
  background: rgba(73, 177, 245, 0.07);
  transition: all 0.22s;
}

.cs-more:hover {
  background: var(--bf-primary);
  color: #fff;
}
</style>
