<script setup>
import { computed } from 'vue'
import { siteStore } from '../stores/site'
import { publishedPosts, categories, tags } from '../stores/posts'
import { talks, messages } from '../stores/social'
import { photos } from '../stores/gallery'

const stats = computed(() => [
  { label: '文章', value: publishedPosts.value.length, to: '/articleList', color: '#49b1f5' },
  { label: '相册', value: photos.length, to: '/photoAlbum', color: '#fbbf24' },
  { label: '随笔', value: talks.length, to: '/talk', color: '#22d3ee' },
  { label: '留言', value: messages.length, to: '/message', color: '#f87171' }
])

const recent = computed(() => publishedPosts.value.slice(0, 5))
const topCategories = computed(() => categories.value.slice(0, 8))
const topTags = computed(() => tags.value.slice(0, 16))
</script>

<template>
  <aside class="bf-aside">
    <!-- 公告卡片（butterfly card_announcement） -->
    <div class="bf-card announce-card" v-reveal>
      <div class="bf-aside-title">公告</div>
      <div class="bf-cloud">
        <p class="announce-text">{{ siteStore.announcement }}</p>
      </div>
    </div>

    <!-- 作者卡片 -->
    <div class="bf-card bf-author" v-reveal="60">
      <img class="avatar" :src="siteStore.author.avatar" alt="avatar" />
      <div class="name">{{ siteStore.author.name }}</div>
      <div class="motto">{{ siteStore.author.motto }}</div>
      <div class="bf-social">
        <a
          v-for="s in siteStore.author.social"
          :key="s.icon"
          :href="s.link"
          target="_blank"
          rel="noopener"
          :title="s.icon"
        >
          <el-icon><component :is="s.icon" /></el-icon>
        </a>
      </div>
    </div>

    <!-- 博客信息（可点击进入） -->
    <div class="bf-card" v-reveal="120">
      <div class="bf-aside-title">博客信息</div>
      <div class="info-grid">
        <router-link
          v-for="s in stats"
          :key="s.label"
          class="info-item"
          :to="s.to"
          :style="{ '--c': s.color }"
        >
          <div class="num" :style="{ color: s.color }">{{ s.value }}</div>
          <div class="label">{{ s.label }}</div>
        </router-link>
      </div>
    </div>

    <!-- 最新文章 -->
    <div class="bf-card" v-reveal="180">
      <div class="bf-aside-title">最新文章</div>
      <router-link v-for="p in recent" :key="p.id" class="bf-aside-row" :to="`/article/${p.id}`">
        <span class="ellipsis">{{ p.title }}</span>
        <span>{{ p.date.slice(5, 10) }}</span>
      </router-link>
    </div>

    <!-- 分类 -->
    <div class="bf-card" v-reveal="240">
      <div class="bf-aside-title">分类</div>
      <div class="bf-cloud">
        <router-link v-for="c in topCategories" :key="c.name" :to="`/categories/${c.name}`">
          {{ c.name }} · {{ c.count }}
        </router-link>
      </div>
    </div>

    <!-- 标签 -->
    <div class="bf-card" v-reveal="300">
      <div class="bf-aside-title">标签</div>
      <div class="bf-cloud">
        <router-link v-for="t in topTags" :key="t.name" :to="`/tags/${t.name}`">{{ t.name }}</router-link>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.info-item {
  text-align: center;
  padding: 8px 0;
  border-radius: 8px;
  background: var(--bf-tag-bg);
  cursor: pointer;
  transition: all 0.22s;
}

.info-item:hover {
  background: color-mix(in srgb, var(--c, #49b1f5) 16%, transparent);
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.info-item .num {
  font-size: 19px;
  font-weight: 700;
  color: var(--bf-primary);
}

.info-item .label {
  font-size: 12px;
  color: var(--bf-text-sub);
  margin-top: 2px;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

/* 公告卡片 */
.announce-card {
  background: linear-gradient(135deg, rgba(73, 177, 245, 0.08), rgba(186, 140, 255, 0.08)), var(--bf-card-bg);
}

.announce-text {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.9;
  color: var(--bf-text-sub);
}
</style>
