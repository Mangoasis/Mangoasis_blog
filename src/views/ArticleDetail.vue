<script setup>
import { computed, ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MdPreview, MdCatalog } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import AsideBox from '../components/AsideBox.vue'
import { siteStore } from '../stores/site'
import { getPost, neighborsOf, addView } from '../stores/posts'
import { isLoggedIn } from '../stores/auth'
import { readingTime, coverStyle } from '../utils'
import NotFound from './NotFound.vue'

const route = useRoute()
const router = useRouter()
const editorId = 'article-preview'

const post = computed(() => getPost(route.params.id))
const neighbors = computed(() => (post.value ? neighborsOf(post.value.id) : { prev: null, next: null }))
const theme = computed(() => (siteStore.dark ? 'dark' : 'light'))
const words = computed(() => (post.value ? post.value.content.replace(/\s/g, '').length : 0))

/** 登录后显示「编辑本文」入口 */
const canEdit = computed(() => isLoggedIn() && !!post.value)

function editThis() {
  router.push({ path: '/write', query: { id: post.value.id } })
}

/** 封面横幅：文章封面（渐变/图片），无封面时按标题取预设渐变 */
const bannerBg = computed(() => (post.value ? coverStyle(post.value.cover || post.value.title) : {}))
const bannerUrl = computed(() => {
  const bg = bannerBg.value || {}
  return bg.backgroundImage ? bg.backgroundImage : null
})
const bannerStyle = computed(() => {
  const img = bannerUrl.value
  if (img && img.includes('covers/')) {
    // 简笔画封面：等高横向平铺，完整展示画面
    return { backgroundImage: img, backgroundSize: 'auto 100%', backgroundRepeat: 'repeat-x', backgroundPosition: 'center' }
  }
  if (img) return { backgroundImage: img, backgroundSize: 'cover', backgroundPosition: 'center' }
  return { background: bannerBg.value.background }
})

const progress = ref(0)
const rewardVisible = ref(false)
const imgFail = reactive({ wechat: false, alipay: false })

function onScroll() {
  const el = document.documentElement
  const total = el.scrollHeight - el.clientHeight
  progress.value = total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  if (post.value) addView(post.value.id)
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <NotFound v-if="!post || post.status !== 'published'" />
  <div v-else>
    <!-- 阅读进度条 -->
    <div class="progress-bar" :style="{ width: progress + '%' }"></div>

    <!-- 封面横幅：文章封面（简笔画自带动画 + Ken Burns 缓推）+ 标题 + 元信息 chips -->
    <section class="post-banner">
      <div class="banner-bg" :style="bannerStyle"></div>
      <div class="banner-scrim"></div>

      <!-- 编辑本文（登录后显示） -->
      <button v-if="canEdit" class="edit-btn glass" @click="editThis">
        <el-icon :size="14"><EditPen /></el-icon>
        编辑本文
      </button>

      <div class="banner-inner" v-reveal>
        <h1 class="post-title">{{ post.title }}</h1>
        <div class="banner-chips">
          <span class="chip"><el-icon><Calendar /></el-icon>{{ post.date.slice(0, 10) }}</span>
          <span class="chip"><el-icon><Refresh /></el-icon>更新 {{ post.updated.slice(0, 10) }}</span>
          <router-link class="chip link" :to="`/categories/${post.category || '未分类'}`">
            <el-icon><FolderOpened /></el-icon>{{ post.category || '未分类' }}
          </router-link>
          <span class="chip"><el-icon><View /></el-icon>{{ post.views || 1 }} 次浏览</span>
          <span class="chip"><el-icon><Timer /></el-icon>约 {{ readingTime(post.content) }} 分钟</span>
        </div>
      </div>
    </section>

    <div class="bf-container">
      <main class="bf-main">
        <article class="bf-card article-card" v-reveal>
          <!-- 正文 -->
          <MdPreview
            :id="editorId"
            :model-value="post.content"
            :theme="theme"
            preview-theme="github"
            code-theme="github"
            class="bf-article-content"
            style="background: transparent"
          />

          <!-- 标签 -->
          <div v-if="post.tags && post.tags.length" class="article-tags">
            <router-link v-for="t in post.tags" :key="t" class="tag-pill" :to="`/tags/${t}`">
              <el-icon><CollectionTag /></el-icon>
              {{ t }}
            </router-link>
          </div>

          <!-- 打赏（butterfly reward） -->
          <div v-if="siteStore.reward?.enable" class="reward">
            <div class="reward-like">觉得文章不错的话，请我喝杯咖啡吧 ☕</div>
            <div class="reward-btns">
              <button class="reward-btn" @click="rewardVisible = true">
                <el-icon style="margin-right: 5px"><Coffee /></el-icon>打赏
              </button>
            </div>
          </div>

          <!-- 版权声明（Butterfly 风格） -->
          <div class="copyright">
            <div class="line">
              <strong>本文作者：</strong>{{ siteStore.author.name }}
            </div>
            <div class="line">
              <strong>本文链接：</strong>
              <a :href="`#${route.path}`">{{ `#${route.path}` }}</a>
            </div>
            <div class="line">
              <strong>版权声明：</strong>本博客所有文章除特别声明外，均采用
              <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">
                CC BY-NC-SA 4.0
              </a>
              许可协议。转载请注明出处！
            </div>
          </div>
        </article>

        <!-- 上一篇 / 下一篇（强化显示） -->
        <div class="post-pager" v-reveal>
          <button class="pp-btn" :disabled="!neighbors.prev" @click="$router.push(`/article/${neighbors.prev?.id}`)">
            <span class="pp-arrow"><el-icon><ArrowLeft /></el-icon></span>
            <span class="pp-text">
              <span class="pp-label">上一篇（更新）</span>
              <span class="pp-title">{{ neighbors.prev ? neighbors.prev.title : '已经是最新一篇' }}</span>
            </span>
          </button>
          <button class="pp-btn pp-next" :disabled="!neighbors.next" @click="$router.push(`/article/${neighbors.next?.id}`)">
            <span class="pp-text">
              <span class="pp-label">下一篇（更早）</span>
              <span class="pp-title">{{ neighbors.next ? neighbors.next.title : '已经是最后一篇' }}</span>
            </span>
            <span class="pp-arrow"><el-icon><ArrowRight /></el-icon></span>
          </button>
        </div>
      </main>

      <AsideBox />

      <!-- 文章目录（宽屏悬浮） -->
      <div class="toc">
        <div class="toc-title">目录</div>
        <MdCatalog :editor-id="editorId" :theme="theme" />
      </div>
    </div>

    <!-- 打赏对话框 -->
    <el-dialog v-model="rewardVisible" title="赞赏支持" width="min(560px, 92%)" align-center>
      <div class="reward-grid">
        <div class="reward-item">
          <div class="qr-box wechat-qr">
            <img v-if="!imgFail.wechat" :src="siteStore.reward.wechat" alt="微信赞赏" @error="imgFail.wechat = true" />
            <div v-else class="qr-fallback"><el-icon :size="34"><Coffee /></el-icon>微信赞赏码</div>
          </div>
          <span>微信</span>
        </div>
        <div class="reward-item">
          <div class="qr-box alipay-qr">
            <img v-if="!imgFail.alipay" :src="siteStore.reward.alipay" alt="支付宝赞赏" @error="imgFail.alipay = true" />
            <div v-else class="qr-fallback"><el-icon :size="34"><Wallet /></el-icon>支付宝赞赏码</div>
          </div>
          <span>支付宝</span>
        </div>
      </div>
      <p class="reward-tip">将收款码图片放到 <code>public/img/reward-wechat.png</code> / <code>reward-alipay.png</code> 即可替换占位图</p>
    </el-dialog>
  </div>
</template>

<style scoped>
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--bf-primary), var(--bf-hover));
  z-index: 200;
  transition: width 0.1s linear;
}

/* ---------- 封面横幅 ---------- */
.post-banner {
  position: relative;
  height: 340px;
  min-height: 260px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  background-color: var(--bf-primary);
}

/* 封面缓推动效：静态图与动画简笔画都更有生命力 */
.banner-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  animation: bannerKB 24s ease-in-out infinite alternate;
  will-change: transform;
}

@keyframes bannerKB {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(1.07);
  }
}

@media (prefers-reduced-motion: reduce) {
  .banner-bg {
    animation: none;
  }
}

.banner-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(8, 18, 32, 0.2),
    rgba(8, 18, 32, 0.08) 40%,
    rgba(8, 18, 32, 0.42) 88%,
    rgba(8, 18, 32, 0.6)
  );
}

html.dark .banner-scrim {
  background: linear-gradient(
    to bottom,
    rgba(4, 10, 20, 0.34),
    rgba(4, 10, 20, 0.16) 40%,
    rgba(4, 10, 20, 0.5) 88%,
    rgba(4, 10, 20, 0.66)
  );
}

/* 编辑本文入口 */
.edit-btn {
  position: absolute;
  top: 74px;
  right: 22px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-family: var(--bf-font-ui);
  color: #fff;
  background: rgba(15, 25, 45, 0.42);
  backdrop-filter: blur(12px) saturate(1.4);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.28);
  cursor: pointer;
  transition: all 0.22s;
}

.edit-btn:hover {
  background: var(--bf-primary);
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 5px 14px rgba(73, 177, 245, 0.4);
}

.banner-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 24px 30px;
  color: #fff;
}

.post-title {
  font-family: var(--bf-font-serif);
  font-size: clamp(24px, 3.4vw, 36px);
  font-weight: 700;
  letter-spacing: 1px;
  margin: 0 0 16px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.55), 0 6px 22px rgba(0, 0, 0, 0.45);
}

.banner-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 12.5px;
  color: #fff;
  background: rgba(15, 25, 45, 0.42);
  backdrop-filter: blur(12px) saturate(1.4);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.22);
  transition: all 0.2s;
}

.chip .el-icon {
  font-size: 13px;
}

.chip.link:hover {
  background: rgba(73, 177, 245, 0.55);
  transform: translateY(-2px);
  color: #fff;
}

/* ---------- 正文卡片 ---------- */
.article-card {
  padding: 30px 34px 26px;
  /* 阅读页接近实心，保证长文可读性 */
  background: rgba(255, 255, 255, 0.93);
}

html.dark .article-card {
  background: rgba(24, 26, 31, 0.93);
}

@media (max-width: 640px) {
  .article-card {
    padding: 20px 18px;
  }

  .post-banner {
    height: 260px;
  }
}

.article-tags {
  margin-top: 26px;
  padding-top: 18px;
  border-top: 1px solid var(--bf-card-border);
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 15px;
  border-radius: 999px;
  font-size: 13px;
  color: var(--bf-text-sub);
  background: var(--bf-tag-bg);
  transition: all 0.22s;
}

.tag-pill:hover {
  color: #fff;
  background: var(--bf-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 114, 66, 0.35);
}

.copyright {
  margin-top: 24px;
  padding: 14px 18px;
  background: var(--bf-tag-bg);
  border-left: 3px solid var(--bf-primary);
  border-radius: 4px;
  font-size: 13.5px;
  color: var(--bf-text-sub);
  line-height: 2;
}

.copyright .line:last-child {
  margin-bottom: 0;
}

/* ---------- 上一篇 / 下一篇（强化版） ---------- */
.post-pager {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.pp-btn {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: var(--bf-radius-lg);
  border: 1px solid var(--bf-card-border);
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(16px) saturate(1.5);
  -webkit-backdrop-filter: blur(16px) saturate(1.5);
  cursor: pointer;
  text-align: left;
  font-family: var(--bf-font-ui);
  box-shadow: var(--bf-shadow);
  transition: all 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
}

html.dark .pp-btn {
  background: rgba(25, 27, 32, 0.74);
}

.pp-btn.pp-next {
  text-align: right;
  flex-direction: row-reverse;
}

.pp-arrow {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bf-primary), #6fc3f7);
  color: #fff;
  font-size: 17px;
  box-shadow: 0 3px 10px rgba(73, 177, 245, 0.4);
  transition: transform 0.28s;
}

.pp-btn:not(:disabled):hover {
  transform: translateY(-3px);
  border-color: rgba(73, 177, 245, 0.55);
  box-shadow: 0 8px 20px rgba(73, 177, 245, 0.25);
}

.pp-btn:not(:disabled):hover .pp-arrow {
  transform: scale(1.1) translateX(-2px);
}

.pp-btn.pp-next:not(:disabled):hover .pp-arrow {
  transform: scale(1.1) translateX(2px);
}

.pp-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pp-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--bf-primary);
  letter-spacing: 1px;
}

.pp-title {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--bf-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pp-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pp-btn:disabled .pp-arrow {
  background: var(--bf-tag-bg);
  color: var(--bf-text-light);
  box-shadow: none;
}

@media (max-width: 640px) {
  .post-pager {
    flex-direction: column;
  }

  .pp-btn.pp-next {
    text-align: left;
    flex-direction: row;
  }
}

/* ---------- 打赏 ---------- */
.reward {
  margin-top: 26px;
  text-align: center;
  padding: 20px 16px;
  border-radius: var(--bf-radius);
  background: var(--bf-tag-bg);
}

.reward-like {
  font-size: 14px;
  color: var(--bf-text-sub);
  margin-bottom: 12px;
}

.reward-btn {
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  padding: 9px 30px;
  border-radius: 22px;
  font-size: 14.5px;
  font-family: var(--bf-font-ui);
  color: #fff;
  background: linear-gradient(135deg, #07c160, #3ddc84);
  box-shadow: 0 4px 12px rgba(7, 193, 96, 0.35);
  transition: transform 0.25s, box-shadow 0.25s;
}

.reward-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(7, 193, 96, 0.45);
}

.reward-grid {
  display: flex;
  justify-content: center;
  gap: 28px;
  flex-wrap: wrap;
}

.reward-item {
  text-align: center;
}

.reward-item > span {
  display: block;
  margin-top: 10px;
  font-size: 14px;
  color: var(--bf-text-sub);
}

.qr-box {
  width: 190px;
  height: 190px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.qr-box.wechat-qr {
  background: linear-gradient(135deg, rgba(7, 193, 96, 0.12), rgba(61, 220, 132, 0.12));
}

.qr-box.alipay-qr {
  background: linear-gradient(135deg, rgba(73, 177, 245, 0.12), rgba(19, 119, 255, 0.12));
}

.qr-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--bf-text-sub);
  font-size: 13.5px;
}

.reward-tip {
  margin: 16px 0 0;
  text-align: center;
  font-size: 12.5px;
  color: var(--bf-text-light);
}

.reward-tip code {
  background: var(--bf-tag-bg);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: var(--bf-font-mono);
}

.toc {
  width: 220px;
  flex-shrink: 0;
  position: sticky;
  top: 84px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding: 4px 0 4px 12px;
  font-size: 14px;
}

.toc-title {
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--bf-text);
}

@media (max-width: 1450px) {
  .toc {
    display: none;
  }
}
</style>
