<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { siteStore, toggleDark } from '../stores/site'
import { openSearch } from '../stores/ui'

const router = useRouter()
const showTop = ref(false)
const progress = ref(0)

const RING_R = 17
const RING_C = 2 * Math.PI * RING_R
const dashOffset = computed(() => RING_C * (1 - progress.value))

function onScroll() {
  const y = window.scrollY
  showTop.value = y > 300
  const total = document.documentElement.scrollHeight - window.innerHeight
  progress.value = total > 0 ? Math.min(1, y / total) : 0
}

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div class="bf-right-buttons">
    <button class="bf-fab search-fab" title="搜索（Ctrl+K）" @click="openSearch()">
      <el-icon :size="18"><Search /></el-icon>
    </button>
    <button
      class="bf-fab"
      :title="siteStore.dark ? '切换到明亮模式' : '切换到暗黑模式'"
      @click="toggleDark($event)"
    >
      <el-icon :size="18">
        <Sunny v-if="siteStore.dark" />
        <Moon v-else />
      </el-icon>
    </button>
    <button class="bf-fab" title="去写作" @click="router.push('/write')">
      <el-icon :size="18"><EditPen /></el-icon>
    </button>
    <button class="bf-fab top-fab" :class="showTop ? 'show' : 'hidden-fab'" title="回到顶部" @click="toTop">
      <svg class="ring" viewBox="0 0 40 40" aria-hidden="true">
        <circle class="ring-track" cx="20" cy="20" :r="RING_R" />
        <circle
          class="ring-bar"
          cx="20"
          cy="20"
          :r="RING_R"
          :stroke-dasharray="RING_C"
          :stroke-dashoffset="dashOffset"
        />
      </svg>
      <el-icon :size="18"><CaretTop /></el-icon>
    </button>
  </div>
</template>

<style scoped>
/* 移动端搜索按钮：桌面隐藏 */
.search-fab {
  display: none;
}

@media (max-width: 1080px) {
  .search-fab {
    display: flex;
  }
}

/* 返回顶部 + 阅读进度环 */
.top-fab {
  position: relative;
}

.ring {
  position: absolute;
  inset: -1px;
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  transform: rotate(-90deg);
  pointer-events: none;
}

.ring-track,
.ring-bar {
  fill: none;
  stroke-width: 2.5;
}

.ring-track {
  stroke: var(--bf-tag-bg);
}

.ring-bar {
  stroke: var(--bf-primary);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.15s linear;
}

.top-fab:hover .ring-track {
  stroke: rgba(255, 255, 255, 0.3);
}

.top-fab:hover .ring-bar {
  stroke: #fff;
}
</style>
