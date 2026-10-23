<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ui, closeSearch } from '../stores/ui'
import { publishedPosts } from '../stores/posts'
import { readingTime } from '../utils'

const router = useRouter()
const query = ref('')
const inputRef = ref(null)
const activeIndex = ref(0)

const results = computed(() => {
  const k = query.value.trim().toLowerCase()
  const list = publishedPosts.value
  if (!k) return list.slice(0, 6)
  return list
    .filter(
      (p) =>
        p.title.toLowerCase().includes(k) ||
        (p.summary || '').toLowerCase().includes(k) ||
        (p.category || '').toLowerCase().includes(k) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(k))
    )
    .slice(0, 8)
})

watch(
  () => ui.searchOpen,
  async (open) => {
    if (open) {
      query.value = ''
      activeIndex.value = 0
      await nextTick()
      inputRef.value?.focus()
    }
  }
)

watch(query, () => (activeIndex.value = 0))

function onKeydown(e) {
  if (!ui.searchOpen) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    const p = results.value[activeIndex.value]
    if (p) select(p)
  }
}

/** 全局快捷键：Ctrl/⌘ + K 或 / */
function globalShortcut(e) {
  const target = e.target
  const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    ui.searchOpen ? closeSearch() : (ui.searchOpen = true)
  } else if (e.key === '/' && !typing && !ui.searchOpen) {
    e.preventDefault()
    ui.searchOpen = true
  }
}

function select(post) {
  closeSearch()
  router.push(`/article/${post.id}`)
}

onMounted(() => window.addEventListener('keydown', globalShortcut))
onUnmounted(() => window.removeEventListener('keydown', globalShortcut))
</script>

<template>
  <el-dialog
    v-model="ui.searchOpen"
    width="min(600px, 92%)"
    top="12vh"
    :show-close="false"
    :with-header="false"
    class="quick-search-dialog"
    @keydown="onKeydown"
  >
    <div class="qs-panel">
      <div class="qs-input-row">
        <el-icon :size="18" class="qs-icon"><Search /></el-icon>
        <input
          ref="inputRef"
          v-model="query"
          class="qs-input"
          placeholder="搜索文章标题 / 摘要 / 标签 / 分类…"
          aria-label="搜索文章"
          @keydown="onKeydown"
        />
        <button class="qs-esc" @click="closeSearch">ESC</button>
      </div>

      <div class="qs-results">
        <div v-if="!query" class="qs-group-label">{{ results.length ? '最近文章' : '' }}</div>
        <div v-else-if="results.length" class="qs-group-label">
          找到 {{ results.length }} 篇相关文章
        </div>
        <div v-else class="qs-empty">没有找到相关文章，换个关键词试试</div>

        <div
          v-for="(p, i) in results"
          :key="p.id"
          class="qs-item"
          :class="{ active: i === activeIndex }"
          @mousemove="activeIndex = i"
          @click="select(p)"
        >
          <el-icon class="qs-item-icon"><Document /></el-icon>
          <div class="qs-item-main">
            <div class="qs-item-title">{{ p.title }}</div>
            <div class="qs-item-meta">
              {{ p.category || '未分类' }} · {{ p.date.slice(0, 10) }} · 约 {{ readingTime(p.content) }} 分钟
            </div>
          </div>
          <el-icon class="qs-enter"><ArrowRight /></el-icon>
        </div>

        <div class="qs-tips">
          <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
          <span><kbd>Enter</kbd> 打开</span>
          <span><kbd>Esc</kbd> 关闭</span>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style>
.quick-search-dialog {
  border-radius: 14px !important;
  overflow: hidden;
}

.quick-search-dialog .el-dialog__header {
  display: none;
}

.quick-search-dialog .el-dialog__body {
  padding: 0;
}
</style>

<style scoped>
.qs-panel {
  display: flex;
  flex-direction: column;
}

.qs-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--bf-card-border);
}

.qs-icon {
  color: var(--bf-primary);
}

.qs-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  font-family: var(--bf-font-ui);
  color: var(--bf-text);
}

.qs-input::placeholder {
  color: var(--bf-text-light);
}

.qs-esc {
  border: 1px solid var(--bf-card-border);
  background: var(--bf-tag-bg);
  color: var(--bf-text-light);
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-family: var(--bf-font-mono);
}

.qs-results {
  max-height: 52vh;
  overflow-y: auto;
  padding: 8px;
}

.qs-group-label {
  font-size: 12px;
  color: var(--bf-text-light);
  padding: 6px 12px 4px;
}

.qs-empty {
  text-align: center;
  color: var(--bf-text-light);
  font-size: 14px;
  padding: 36px 0 28px;
}

.qs-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.qs-item.active {
  background: rgba(73, 177, 245, 0.1);
}

.qs-item-icon {
  color: var(--bf-text-light);
  flex-shrink: 0;
}

.qs-item.active .qs-item-icon {
  color: var(--bf-primary);
}

.qs-item-main {
  flex: 1;
  min-width: 0;
}

.qs-item-title {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--bf-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qs-item-meta {
  font-size: 12px;
  color: var(--bf-text-light);
  margin-top: 2px;
}

.qs-enter {
  color: var(--bf-text-light);
  opacity: 0;
  transition: opacity 0.15s, transform 0.15s;
}

.qs-item.active .qs-enter {
  opacity: 1;
  transform: translateX(2px);
  color: var(--bf-primary);
}

.qs-tips {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 10px 0 6px;
  border-top: 1px solid var(--bf-card-border);
  margin-top: 6px;
  font-size: 12px;
  color: var(--bf-text-light);
}

.qs-tips kbd {
  font-family: var(--bf-font-mono);
  background: var(--bf-tag-bg);
  border: 1px solid var(--bf-card-border);
  border-radius: 4px;
  padding: 1px 6px;
  margin: 0 2px;
  font-size: 11px;
}
</style>
