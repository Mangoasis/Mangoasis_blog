<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { siteStore } from '../stores/site'

const props = defineProps({
  // small: 内页小横幅（渐变）；full: 首页整屏大图
  size: { type: String, default: 'small' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  // 横幅背景图（full 模式默认使用本地风景图）
  image: { type: String, default: '' },
  // 首页副标题打字机效果
  typing: { type: Boolean, default: false }
})

const typed = ref('')
const contentOpacity = ref(1)
const contentShift = ref(0)

const fullImage = computed(() => props.image || './img/banner.svg')
const bannerStyle = computed(() =>
  props.size === 'full'
    ? {
        backgroundImage: `url("${fullImage.value}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : {}
)

let timer = null

const typingTexts = ['你要做冲出的黑马', '不是坠落的星星', '你也可以做生活的主人phphph~', '记录学习、生活与思考 ✍️']

let textIndex = 0
let charIndex = 0
let deleting = false

function tick() {
  const current = typingTexts[textIndex]
  if (!deleting) {
    charIndex++
    typed.value = current.slice(0, charIndex)
    if (charIndex >= current.length) {
      deleting = true
      timer = setTimeout(tick, 2200)
      return
    }
    timer = setTimeout(tick, 120)
  } else {
    charIndex--
    typed.value = current.slice(0, charIndex)
    if (charIndex <= 0) {
      deleting = false
      textIndex = (textIndex + 1) % typingTexts.length
    }
    timer = setTimeout(tick, 45)
  }
}

/** 滚动时横幅内容渐隐 + 轻微视差（Butterfly 首页行为） */
function onScroll() {
  if (props.size !== 'full') return
  const h = window.innerHeight
  const y = window.scrollY
  contentOpacity.value = Math.max(0, 1 - y / (h * 0.55))
  contentShift.value = Math.min(y * 0.28, h * 0.3)
}

onMounted(() => {
  if (props.typing) tick()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  clearTimeout(timer)
  window.removeEventListener('scroll', onScroll)
})

function scrollDown() {
  window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
}
</script>

<template>
  <section class="bf-banner" :class="size" :style="bannerStyle">
    <!-- full 模式下叠加顶部遮罩，保证白字可读 -->
    <div v-if="size === 'full'" class="banner-mask"></div>

    <div
      class="banner-content"
      :style="{ opacity: contentOpacity, transform: `translateY(${contentShift}px)` }"
    >
      <div class="bf-banner-title">{{ title }}</div>
      <div v-if="typing" class="bf-banner-sub">
        {{ typed }}<span class="cursor"></span>
      </div>
      <div v-else-if="subtitle" class="bf-banner-sub">{{ subtitle }}</div>
    </div>

    <div
      v-if="size === 'full'"
      class="bf-scroll-down"
      :style="{ opacity: contentOpacity }"
      title="向下滚动"
      @click="scrollDown"
    >
      <el-icon :size="28"><ArrowDownBold /></el-icon>
    </div>
  </section>
</template>

<style scoped>
.banner-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(10, 18, 40, 0.28), rgba(10, 18, 40, 0.05) 45%, rgba(10, 18, 40, 0.18));
}

.banner-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  will-change: opacity, transform;
}
</style>
