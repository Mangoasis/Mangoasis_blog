<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { coverStyle } from '../utils'

const props = defineProps({
  post: { type: Object, required: true }
})

const router = useRouter()
const cover = computed(() => coverStyle(props.post.cover || props.post.title))
</script>

<style scoped>
.cover-letter {
  position: absolute;
  right: 18px;
  bottom: 6px;
  font-family: var(--bf-font-serif);
  font-size: 88px;
  font-weight: 700;
  line-height: 1;
  color: rgba(255, 255, 255, 0.28);
  text-shadow: 0 4px 18px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  user-select: none;
}
</style>

<template>
  <article class="bf-card bf-card-hover bf-post-card" @click="router.push(`/article/${post.id}`)">
    <div class="bf-post-cover" :style="cover">
      <span class="cover-letter">{{ (post.title || '文').slice(0, 1) }}</span>
      <span v-if="post.top" class="pin">置顶</span>
    </div>
    <div class="bf-post-body">
      <h2 class="bf-post-title">{{ post.title }}</h2>
      <div class="bf-post-meta">
        <span class="item">
          <el-icon><Calendar /></el-icon>{{ post.date.slice(0, 10) }}
        </span>
        <span class="item">
          <el-icon><FolderOpened /></el-icon>{{ post.category || '未分类' }}
        </span>
      </div>
      <p class="bf-post-desc">{{ post.summary }}</p>
      <div class="bf-tags">
        <router-link v-for="t in post.tags" :key="t" class="bf-tag" :to="`/tags/${t}`"># {{ t }}</router-link>
      </div>
    </div>
  </article>
</template>
