<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from './components/NavBar.vue'
import BlogFooter from './components/BlogFooter.vue'
import RightButtons from './components/RightButtons.vue'
import QuickSearch from './components/QuickSearch.vue'
import { hydrateFromRepo } from './stores/backup'

const route = useRoute()
const router = useRouter()
// 写作页全屏编辑，不显示页脚
const showFooter = computed(() => route.name !== 'Write')

/* 路由切换顶部进度条 */
const routeBar = ref(0)
let hideTimer = null

router.beforeEach(() => {
  clearTimeout(hideTimer)
  routeBar.value = 25
})

router.afterEach(() => {
  routeBar.value = 100
  hideTimer = setTimeout(() => (routeBar.value = 0), 400)
})

onUnmounted(() => clearTimeout(hideTimer))

/* 全站壁纸视差：滚动时壁纸以 0.08 倍速缓慢下移（rAF 节流） */
const wallpaperUrl = './img/wallpaper.jpg'
const parallax = ref(0)
let ticking = false

function onWallScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    parallax.value = Math.min(window.scrollY * 0.08, window.innerHeight * 0.1)
    ticking = false
  })
}

onMounted(() => {
  window.addEventListener('scroll', onWallScroll, { passive: true })
  // 首次访问（本地无数据）时从仓库加载站长发布的内容
  hydrateFromRepo()
})
onUnmounted(() => window.removeEventListener('scroll', onWallScroll))
</script>

<template>
  <!-- 全站固定壁纸背景（视差 + 缓慢呼吸缩放） -->
  <div class="wallpaper-parallax" :style="{ transform: `translateY(${parallax}px)` }" aria-hidden="true">
    <div class="wallpaper-img" :style="{ backgroundImage: `url('${wallpaperUrl}')` }"></div>
    <div class="wallpaper-scrim"></div>
  </div>

  <NavBar />
  <div class="route-progress" :class="{ done: routeBar >= 100 }" :style="{ width: routeBar + '%' }"></div>
  <router-view v-slot="{ Component }">
    <transition name="fade-slide" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <BlogFooter v-if="showFooter" />
  <RightButtons />
  <QuickSearch />
</template>

<style scoped>
.wallpaper-parallax {
  position: fixed;
  left: 0;
  right: 0;
  top: -12vh;
  height: 124vh;
  z-index: -1;
  will-change: transform;
}

.wallpaper-img {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  animation: kenburns 46s ease-in-out infinite alternate;
}

/* 缓慢呼吸式缩放，让壁纸有生命力 */
@keyframes kenburns {
  from {
    transform: scale(1.02);
  }

  to {
    transform: scale(1.1);
  }
}

/* 全局可读性遮罩：顶部导航/英雄区加深，底部内容区加深 */
.wallpaper-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(8, 18, 32, 0.52),
    rgba(8, 18, 32, 0.24) 30%,
    rgba(8, 18, 32, 0.34) 62%,
    rgba(8, 18, 32, 0.6)
  );
}

html.dark .wallpaper-scrim {
  background: linear-gradient(
    to bottom,
    rgba(4, 10, 20, 0.64),
    rgba(4, 10, 20, 0.38) 32%,
    rgba(4, 10, 20, 0.46) 64%,
    rgba(4, 10, 20, 0.72)
  );
}
</style>
