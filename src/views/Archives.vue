<script setup>
import { computed } from 'vue'
import PageBanner from '../components/PageBanner.vue'
import AsideBox from '../components/AsideBox.vue'
import { publishedPosts } from '../stores/posts'
import { photos } from '../stores/gallery'
import { talks } from '../stores/social'

/**
 * 统一时间线：文章 + 照片 + 随笔按时间倒序聚合
 */
const events = computed(() => {
  const list = [
    ...publishedPosts.value.map((p) => ({
      type: 'post',
      date: p.date,
      title: p.title,
      desc: p.summary,
      to: `/article/${p.id}`
    })),
    ...photos.map((p) => ({
      type: 'photo',
      date: p.date + ' 12:00',
      title: p.title,
      desc: p.desc,
      thumb: p.src,
      album: p.album,
      to: '/photoAlbum'
    })),
    ...talks.map((t) => ({
      type: 'talk',
      date: t.date,
      title: t.content ? t.content.slice(0, 60) : '（配图随笔）',
      thumb: (t.images || [])[0],
      imgCount: (t.images || []).length,
      to: '/talk'
    }))
  ]
  list.sort((a, b) => (a.date < b.date ? 1 : -1))

  const byYear = new Map()
  for (const e of list) {
    const y = e.date.slice(0, 4)
    if (!byYear.has(y)) byYear.set(y, [])
    byYear.get(y).push(e)
  }
  return [...byYear.entries()].sort((a, b) => b[0].localeCompare(a[0]))
})

const typeMeta = {
  post: { label: '文章', color: '#49b1f5', icon: 'Tickets' },
  photo: { label: '照片', color: '#fbbf24', icon: 'Picture' },
  talk: { label: '随笔', color: '#22d3ee', icon: 'Notebook' }
}
</script>

<template>
  <div>
    <PageBanner title="时间线" subtitle="文章、照片与随笔，都留在这里" />

    <div class="bf-container">
      <main class="bf-main">
        <div class="bf-card archive-card" v-reveal>
          <div class="stats">
            共 <b>{{ events.reduce((n, [, list]) => n + list.length, 0) }}</b> 条足迹，继续记录！
          </div>

          <template v-for="[year, list] in events" :key="year">
            <div class="bf-archive-year">{{ year }}</div>
            <div class="bf-timeline">
              <div v-for="(e, i) in list" :key="e.type + e.date + i" class="bf-timeline-item tl-event" v-reveal="(i % 8) * 50">
                <span class="bf-timeline-date">{{ e.date.slice(5, 16) }}</span>
                <router-link class="tl-type" :to="e.to" :style="{ '--c': typeMeta[e.type].color }">
                  <el-icon :size="12"><component :is="typeMeta[e.type].icon" /></el-icon>
                  {{ typeMeta[e.type].label }}
                </router-link>

                <!-- 照片 / 随笔配图缩略图 -->
                <img
                  v-if="e.thumb"
                  :src="e.thumb"
                  :alt="e.title"
                  class="tl-thumb"
                  loading="lazy"
                  @click="$router.push(e.to)"
                />

                <router-link class="bf-timeline-title" :to="e.to">
                  {{ e.title }}<template v-if="e.type === 'talk' && e.imgCount">（{{ e.imgCount }} 张配图）</template>
                </router-link>
                <p v-if="e.desc" class="tl-desc">{{ e.desc }}</p>
              </div>
            </div>
          </template>

          <el-empty v-if="!events.length" description="还没有任何足迹，去写一篇文章或传一张照片吧" />
        </div>
      </main>

      <AsideBox />
    </div>
  </div>
</template>

<style scoped>
.archive-card {
  padding: 26px 30px 30px;
}

.stats {
  text-align: center;
  color: var(--bf-text-sub);
  font-size: 14.5px;
  padding-bottom: 8px;
}

.stats b {
  color: var(--bf-primary);
  font-size: 18px;
  margin: 0 2px;
}

@media (max-width: 640px) {
  .archive-card {
    padding: 18px 16px 22px;
  }
}

/* 类型徽章 */
.tl-type {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--c);
  background: color-mix(in srgb, var(--c) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--c) 30%, transparent);
  padding: 1px 9px;
  border-radius: 10px;
  margin-right: 8px;
  vertical-align: 1px;
  transition: all 0.2s;
}

.tl-type:hover {
  background: var(--c);
  color: #fff;
}

/* 缩略图 */
.tl-thumb {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  object-fit: cover;
  margin-left: 8px;
  vertical-align: middle;
  cursor: pointer;
  box-shadow: var(--bf-shadow);
  transition: transform 0.25s;
}

.tl-thumb:hover {
  transform: scale(1.08);
}

.tl-desc {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--bf-text-sub);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 640px;
}
</style>
