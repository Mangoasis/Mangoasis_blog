<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { coverStyle, readingTime } from '../utils'

const props = defineProps({
  post: { type: Object, required: true }
})

const router = useRouter()
const cover = computed(() => coverStyle(props.post.cover || props.post.title))
</script>

<template>
  <article class="post-row bf-card bf-card-hover" @click="router.push(`/article/${post.id}`)">
    <div class="row-cover" :style="cover">
      <span class="cover-letter">{{ (post.title || '文').slice(0, 1) }}</span>
      <span v-if="post.top" class="pin">置顶</span>
    </div>
    <div class="row-info">
      <h2 class="bf-post-title">{{ post.title }}</h2>
      <div class="bf-post-meta">
        <span class="item"><el-icon><Calendar /></el-icon>{{ post.date.slice(0, 10) }}</span>
        <span class="item"><el-icon><FolderOpened /></el-icon>{{ post.category || '未分类' }}</span>
        <span class="item"><el-icon><View /></el-icon>{{ post.views || 1 }} 浏览</span>
        <span class="item"><el-icon><Timer /></el-icon>约 {{ readingTime(post.content) }} 分钟</span>
      </div>
      <p class="bf-post-desc">{{ post.summary }}</p>
      <div class="row-foot">
        <div class="bf-tags">
          <router-link v-for="t in post.tags" :key="t" class="bf-tag" :to="`/tags/${t}`"># {{ t }}</router-link>
        </div>
        <span class="read-more">阅读全文<el-icon><ArrowRight /></el-icon></span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.post-row {
  display: flex;
  gap: 16px;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  overflow: hidden;
}

.row-cover {
  width: 220px;
  height: 150px;
  border-radius: 8px;
  flex-shrink: 0;
  position: relative;
  background: var(--bf-primary);
}

.row-cover .pin {
  position: absolute;
  top: 8px;
  left: 8px;
  background: var(--bf-hover);
  color: #fff;
  font-size: 12px;
  padding: 1px 10px;
  border-radius: 12px;
}

.row-cover .cover-letter {
  position: absolute;
  right: 8px;
  bottom: 2px;
  font-family: var(--bf-font-serif);
  font-size: 56px;
  font-weight: 700;
  line-height: 1;
  color: rgba(255, 255, 255, 0.3);
  pointer-events: none;
  user-select: none;
}

.row-info {
  flex: 1;
  min-width: 0;
}

.row-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.read-more {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  color: var(--bf-primary);
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.28s;
}

.post-row:hover .read-more {
  opacity: 1;
  transform: translateX(0);
}

@media (max-width: 640px) {
  .post-row {
    flex-direction: column;
    gap: 0;
    padding: 0;
  }

  .row-cover {
    width: 100%;
    height: 170px;
    border-radius: 8px 8px 0 0;
  }

  .row-info {
    padding: 14px 16px 16px;
  }

  .read-more {
    display: none;
  }

  .row-foot {
    justify-content: flex-start;
  }
}
</style>
