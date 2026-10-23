<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import PostRow from '../components/PostRow.vue'
import { siteStore } from '../stores/site'
import { publishedPosts, categories } from '../stores/posts'
import { photos, albums, photosOf } from '../stores/gallery'
import { talks } from '../stores/social'

const router = useRouter()

/* ---------- 相册筛选 ---------- */
const activeAlbum = ref('全部')
const list = computed(() => photosOf(activeAlbum.value))
const previewList = computed(() => list.value.map((p) => p.src))

/* ---------- 随笔 / 分类 / 最新文章 ---------- */
const latestTalks = computed(() => talks.slice(0, 2))
const catColors = [
  'linear-gradient(135deg, #49b1f5, #82c8f8)',
  'linear-gradient(135deg, #ff9f43, #ffcb80)',
  'linear-gradient(135deg, #6f42c1, #a78bfa)',
  'linear-gradient(135deg, #00b96b, #7fe0b0)',
  'linear-gradient(135deg, #f759ab, #ffa3cd)',
  'linear-gradient(135deg, #17c2e5, #8ae2f5)'
]
const latestPosts = computed(() => publishedPosts.value.slice(0, 3))

/* ---------- 英雄区：打字机 + 滚动视差 ---------- */
const typed = ref('')
const contentOpacity = ref(1)
const contentShift = ref(0)

const typingTexts = ['你要做冲出的黑马', '不是坠落的星星', '你也可以做生活的主人phphph~', '记录学习、生活与思考 ✍️']
let textIndex = 0
let charIndex = 0
let deleting = false
let typeTimer = null

function tick() {
  const current = typingTexts[textIndex]
  if (!deleting) {
    charIndex++
    typed.value = current.slice(0, charIndex)
    if (charIndex >= current.length) {
      deleting = true
      typeTimer = setTimeout(tick, 2400)
      return
    }
    typeTimer = setTimeout(tick, 120)
  } else {
    charIndex--
    typed.value = current.slice(0, charIndex)
    if (charIndex <= 0) {
      deleting = false
      textIndex = (textIndex + 1) % typingTexts.length
    }
    typeTimer = setTimeout(tick, 45)
  }
}

function onScroll() {
  const h = window.innerHeight
  const y = window.scrollY
  contentOpacity.value = Math.max(0, 1 - y / (h * 0.55))
  contentShift.value = Math.min(y * 0.3, h * 0.3)
}

function scrollDown() {
  window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
}

onMounted(() => {
  tick()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => {
  clearTimeout(typeTimer)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="home-page">
    <!-- 英雄区（壁纸背景由全局提供） -->
    <section class="hero">
      <div class="hero-content" :style="{ opacity: contentOpacity, transform: `translateY(${contentShift}px)` }">
        <div class="hero-avatar" v-reveal>
          <img :src="siteStore.author.avatar" alt="avatar" />
        </div>
        <h1 class="hero-title" v-reveal="80">{{ siteStore.title }}</h1>
        <p class="hero-typing" v-reveal="160">{{ typed }}<span class="cursor"></span></p>
        <p class="hero-desc" v-reveal="240">{{ siteStore.desc }}</p>
        <div class="hero-actions" v-reveal="320">
          <button class="hero-btn primary" @click="router.push('/write')">
            <el-icon><EditPen /></el-icon>开始写作
          </button>
          <button class="hero-btn" @click="router.push('/articleList')">
            <el-icon><Tickets /></el-icon>浏览文章
          </button>
        </div>
      </div>
      <div class="hero-scroll" :style="{ opacity: contentOpacity }" title="向下滚动" @click="scrollDown">
        <el-icon :size="26"><ArrowDownBold /></el-icon>
      </div>
    </section>

    <!-- 相册（瀑布流） -->
    <section class="wall-section">
      <div class="section-bar glass" v-reveal>
        <div class="bar-icon album"><el-icon :size="18"><Camera /></el-icon></div>
        <div class="bar-title">相册</div>
        <div class="chips">
          <button
            v-for="(a, i) in albums"
            :key="a.name"
            class="glass-chip"
            :class="{ active: activeAlbum === a.name }"
            v-reveal="i * 50"
            @click="activeAlbum = a.name"
          >
            {{ a.name }}<span class="chip-num">{{ a.count }}</span>
          </button>
        </div>
        <button class="bar-more" @click="router.push('/photoAlbum')">
          进入相册 · 管理照片<el-icon><ArrowRight /></el-icon>
        </button>
      </div>

      <div class="masonry">
        <div
          v-for="(p, i) in list"
          :key="p.id"
          class="wall-card glass shine"
          v-reveal="(i % 8) * 60"
        >
          <el-image
            :src="p.src"
            :preview-src-list="previewList"
            :initial-index="list.indexOf(p)"
            fit="cover"
            loading="lazy"
            preview-teleported
            class="wall-img"
          >
            <template #placeholder>
              <div class="img-skeleton"></div>
            </template>
            <template #error>
              <div class="wall-error"><el-icon :size="30"><PictureFilled /></el-icon></div>
            </template>
          </el-image>
          <div class="wall-info">
            <span class="wall-title">{{ p.title }}</span>
            <span class="wall-meta">{{ p.album }} · {{ p.date }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 随笔 -->
    <section class="talks-section">
      <div class="section-bar glass" v-reveal>
        <div class="bar-icon talk"><el-icon :size="18"><Notebook /></el-icon></div>
        <div class="bar-title">随笔</div>
        <button class="bar-more" @click="router.push('/talk')">
          全部随笔<el-icon><ArrowRight /></el-icon>
        </button>
      </div>

      <div class="talk-grid">
        <div
          v-for="(t, i) in latestTalks"
          :key="t.id"
          class="bf-card talk-mini"
          v-reveal="i * 80"
          @click="router.push('/talk')"
        >
          <div class="tm-head">
            <img :src="siteStore.author.avatar" alt="avatar" />
            <div class="tm-who">
              <div class="tm-name">{{ siteStore.author.name }}</div>
              <div class="tm-date">{{ t.date }}</div>
            </div>
            <span class="tm-badge">随笔</span>
          </div>
          <p v-if="t.content" class="tm-content">{{ t.content }}</p>
          <div v-if="t.images && t.images.length" class="tm-imgs" :class="'n' + Math.min(t.images.length, 3)">
            <el-image
              v-for="(img, j) in t.images.slice(0, 3)"
              :key="j"
              :src="img"
              :preview-src-list="t.images"
              :initial-index="j"
              fit="cover"
              loading="lazy"
              preview-teleported
              class="tm-img"
              @click.stop
            />
          </div>
          <div class="tm-foot">
            <span><el-icon><Star /></el-icon>{{ t.likes }}</span>
            <span><el-icon><ChatDotRound /></el-icon>{{ t.comments.length }}</span>
            <span class="tm-go">去互动<el-icon><ArrowRight /></el-icon></span>
          </div>
        </div>
        <div class="bf-card talk-mini empty" v-if="!latestTalks.length" v-reveal="80">
          <el-empty description="还没有随笔" :image-size="60" />
        </div>
      </div>
    </section>

    <!-- 分类 -->
    <section class="cats-section">
      <div class="section-bar glass" v-reveal>
        <div class="bar-icon cat"><el-icon :size="18"><Collection /></el-icon></div>
        <div class="bar-title">分类</div>
        <button class="bar-more" @click="router.push('/categories')">
          全部分类<el-icon><ArrowRight /></el-icon>
        </button>
      </div>

      <div class="cat-cards">
        <router-link
          v-for="(c, i) in categories"
          :key="c.name"
          class="bf-card cat-card-item"
          :to="`/categories/${c.name}`"
          v-reveal="(i % 6) * 60"
        >
          <span class="cat-dot" :style="{ background: catColors[i % catColors.length] }"></span>
          <span class="cat-name">{{ c.name }}</span>
          <span class="cat-count">{{ c.count }} 篇</span>
        </router-link>
      </div>
    </section>

    <!-- 最新文章 -->
    <section class="posts-section">
      <div class="section-bar glass" v-reveal>
        <div class="bar-icon post"><el-icon :size="18"><Tickets /></el-icon></div>
        <div class="bar-title">最新文章</div>
        <button class="bar-more" @click="router.push('/articleList')">
          全部文章<el-icon><ArrowRight /></el-icon>
        </button>
      </div>

      <PostRow v-for="(p, i) in latestPosts" :key="p.id" :post="p" class="glass" v-reveal="i * 80" />
      <el-empty v-if="!latestPosts.length" description="还没有文章，点击右上角「写作」发布第一篇吧" />
    </section>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
}

/* ---------- 英雄区 ---------- */
.hero {
  height: 100vh;
  min-height: 460px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: #fff;
}

@supports (height: 100svh) {
  .hero {
    height: 100svh;
  }
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 20px;
  will-change: opacity, transform;
}

.hero-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  padding: 3px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
  margin-bottom: 18px;
}

.hero-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  object-position: center 22%;
  display: block;
}

.hero-title {
  font-family: var(--bf-font-serif);
  font-size: clamp(34px, 5.6vw, 56px);
  font-weight: 700;
  letter-spacing: 4px;
  text-indent: 4px;
  margin: 0 0 12px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.55), 0 6px 28px rgba(0, 0, 0, 0.5);
}

.hero-typing {
  font-size: clamp(15px, 2.2vw, 20px);
  letter-spacing: 1.5px;
  margin: 0 0 14px;
  min-height: 30px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6), 0 4px 18px rgba(0, 0, 0, 0.45);
}

.hero-typing .cursor {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  margin-left: 3px;
  vertical-align: text-bottom;
  background: #fff;
  animation: blink 0.8s steps(1) infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.hero-desc {
  font-size: 14.5px;
  max-width: 560px;
  line-height: 1.8;
  margin: 0 0 26px;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.65), 0 3px 14px rgba(0, 0, 0, 0.5);
}

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 26px;
  border-radius: 999px;
  font-size: 14.5px;
  font-family: var(--bf-font-ui);
  color: #fff;
  background: rgba(20, 30, 50, 0.35);
  backdrop-filter: blur(14px) saturate(1.5);
  -webkit-backdrop-filter: blur(14px) saturate(1.5);
  border: 1px solid rgba(255, 255, 255, 0.28);
  cursor: pointer;
  transition: all 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.hero-btn:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.5);
}

.hero-btn.primary {
  background: linear-gradient(135deg, var(--bf-primary), #6fc3f7);
  border-color: transparent;
  box-shadow: 0 6px 18px rgba(73, 177, 245, 0.45);
}

.hero-btn.primary:hover {
  box-shadow: 0 10px 24px rgba(73, 177, 245, 0.55);
}

.hero-scroll {
  position: absolute;
  bottom: 26px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  color: #fff;
  animation: heroFloat 1.8s ease-in-out infinite;
}

@keyframes heroFloat {
  0%,
  100% {
    transform: translate(-50%, 0);
  }

  50% {
    transform: translate(-50%, 10px);
  }
}

/* ---------- 区块通用 ---------- */
.wall-section,
.talks-section,
.cats-section,
.posts-section {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 16px 26px;
}

.posts-section {
  padding-bottom: 48px;
}

.section-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 13px 18px;
  border-radius: var(--bf-radius-lg);
  margin-bottom: 20px;
  box-shadow: var(--bf-shadow);
}

/* 区块图标徽章：渐变圆角块 + 白色图标 */
.bar-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
}

.bar-icon.album {
  background: linear-gradient(135deg, #ffb74d, #ff7043);
}

.bar-icon.talk {
  background: linear-gradient(135deg, #22d3ee, #0ea5e9);
}

.bar-icon.cat {
  background: linear-gradient(135deg, #34d399, #059669);
}

.bar-icon.post {
  background: linear-gradient(135deg, #a78bfa, #7c3aed);
}

.bar-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--bf-text);
  margin-right: 4px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.chip-num {
  margin-left: 4px;
  font-size: 11.5px;
  opacity: 0.8;
}

.bar-more {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid rgba(73, 177, 245, 0.4);
  background: rgba(73, 177, 245, 0.08);
  color: var(--bf-primary);
  font-size: 13px;
  cursor: pointer;
  border-radius: 999px;
  padding: 6px 14px;
  transition: all 0.22s;
  font-family: var(--bf-font-ui);
  white-space: nowrap;
}

.bar-more:hover {
  background: var(--bf-primary);
  color: #fff;
  transform: translateX(2px);
  box-shadow: 0 4px 12px rgba(73, 177, 245, 0.35);
}

/* ---------- 相册瀑布流 ---------- */
.masonry {
  columns: 4 250px;
  column-gap: 16px;
}

/* 移动端：2 列紧凑瀑布流 */
@media (max-width: 640px) {
  .masonry {
    columns: 2;
    column-gap: 10px;
  }

  .wall-card {
    margin-bottom: 10px;
  }

  .wall-info {
    padding: 8px 10px;
  }

  .wall-title {
    font-size: 12.5px;
  }

  .wall-meta {
    display: none;
  }
}

.wall-card {
  break-inside: avoid;
  margin-bottom: 16px;
  border-radius: var(--bf-radius-lg);
  overflow: hidden;
  box-shadow: var(--bf-shadow);
  transition: transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.35s;
}

.wall-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--bf-shadow-hover);
}

.wall-img {
  width: 100%;
  display: block;
  cursor: zoom-in;
  aspect-ratio: auto;
  min-height: 140px;
}

.wall-img :deep(img) {
  transition: transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.wall-card:hover .wall-img :deep(img) {
  transform: scale(1.05);
}

.wall-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
  background: var(--bf-tag-bg);
  color: var(--bf-text-light);
}

.wall-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 11px 14px;
}

.wall-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--bf-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wall-meta {
  font-size: 12px;
  color: var(--bf-text-light);
  white-space: nowrap;
}

/* ---------- 随笔区块 ---------- */
.talk-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 900px) {
  .talk-grid {
    grid-template-columns: 1fr;
  }
}

.talk-mini {
  padding: 16px 18px;
  cursor: pointer;
}

.tm-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.tm-head img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center 22%;
}

.tm-who {
  flex: 1;
}

.tm-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--bf-text);
}

.tm-date {
  font-size: 12px;
  color: var(--bf-text-light);
}

.tm-badge {
  font-size: 11px;
  font-weight: 600;
  color: #22d3ee;
  background: rgba(34, 211, 238, 0.12);
  border: 1px solid rgba(34, 211, 238, 0.35);
  padding: 1px 9px;
  border-radius: 10px;
}

.tm-content {
  margin: 0 0 8px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--bf-text);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tm-imgs {
  display: grid;
  gap: 6px;
  margin-bottom: 10px;
}

.tm-imgs.n1 {
  grid-template-columns: 1fr;
}

.tm-imgs.n2,
.tm-imgs.n3 {
  grid-template-columns: repeat(3, 1fr);
}

.tm-img {
  width: 100%;
  height: 110px;
  border-radius: 8px;
  cursor: zoom-in;
}

.tm-foot {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--bf-text-sub);
  font-size: 13px;
}

.tm-foot span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tm-go {
  margin-left: auto;
  color: var(--bf-primary);
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.25s;
}

.talk-mini:hover .tm-go {
  opacity: 1;
  transform: translateX(0);
}

.talk-mini.empty {
  display: flex;
  justify-content: center;
}

/* ---------- 分类区块 ---------- */
.cat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

@media (max-width: 900px) {
  .cat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

.cat-card-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 18px;
  cursor: pointer;
}

.cat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06);
}

.cat-name {
  flex: 1;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--bf-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.cat-card-item:hover .cat-name {
  color: var(--bf-primary);
}

.cat-count {
  font-size: 12px;
  color: var(--bf-text-sub);
  background: var(--bf-tag-bg);
  padding: 2px 10px;
  border-radius: 10px;
}

/* 文章卡片使用玻璃样式 */
.posts-section :deep(.post-row) {
  border-radius: var(--bf-radius-lg);
}
</style>
