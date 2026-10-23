<script setup>
import { ref, computed, nextTick } from 'vue'
import { Search } from '@element-plus/icons-vue'
import PageBanner from '../components/PageBanner.vue'
import PostRow from '../components/PostRow.vue'
import AsideBox from '../components/AsideBox.vue'
import { publishedPosts } from '../stores/posts'

const keyword = ref('')
const PAGE_SIZE = 4
const page = ref(1)

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return publishedPosts.value
  return publishedPosts.value.filter(
    (p) =>
      p.title.toLowerCase().includes(k) ||
      (p.summary || '').toLowerCase().includes(k) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(k)) ||
      (p.category || '').toLowerCase().includes(k)
  )
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const pagePosts = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

/** 页码序列：页数多时用省略号折叠 */
const pagerItems = computed(() => {
  const items = []
  const total = pageCount.value
  const cur = page.value
  if (total <= 7) {
    for (let i = 1; i <= total; i++) items.push({ key: i, page: i, label: String(i) })
    return items
  }
  items.push({ key: 1, page: 1, label: '1' })
  const start = Math.max(2, cur - 1)
  const end = Math.min(total - 1, cur + 1)
  if (start > 2) items.push({ key: 'l', ell: true, label: '…' })
  for (let i = start; i <= end; i++) items.push({ key: i, page: i, label: String(i) })
  if (end < total - 1) items.push({ key: 'r', ell: true, label: '…' })
  items.push({ key: total, page: total, label: String(total) })
  return items
})

function goPage(p) {
  if (p < 1 || p > pageCount.value || p === page.value) return
  page.value = p
  nextTick(() => {
    const main = document.querySelector('.bf-main')
    if (main) window.scrollTo({ top: main.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' })
  })
}
</script>

<template>
  <div>
    <PageBanner title="文章" subtitle="共记录生活的点点滴滴" />

    <div class="bf-container">
      <main class="bf-main">
        <div class="toolbar bf-card">
          <el-input
            v-model="keyword"
            placeholder="搜索文章标题 / 摘要 / 标签 / 分类"
            clearable
            :prefix-icon="Search"
            @input="page = 1"
          />
          <span class="count">共 {{ filtered.length }} 篇</span>
        </div>

        <el-empty v-if="!pagePosts.length" description="没有找到相关文章" />

        <PostRow v-for="(p, i) in pagePosts" :key="p.id" :post="p" v-reveal="(i % 8) * 60" />

        <!-- 翻页（玻璃页码 + 上下页） -->
        <div class="list-pager" v-reveal>
          <template v-if="pageCount > 1">
            <button class="lp-btn nav" :disabled="page <= 1" @click="goPage(page - 1)">
              <el-icon><ArrowLeft /></el-icon>上一页
            </button>
            <template v-for="item in pagerItems" :key="item.key">
              <span v-if="item.ell" class="lp-ell">…</span>
              <button
                v-else
                class="lp-btn num"
                :class="{ active: item.page === page }"
                @click="goPage(item.page)"
              >
                {{ item.label }}
              </button>
            </template>
            <button class="lp-btn nav" :disabled="page >= pageCount" @click="goPage(page + 1)">
              下一页<el-icon><ArrowRight /></el-icon>
            </button>
          </template>
          <div v-else class="list-end">— 已经到底啦，共 {{ filtered.length }} 篇文章 —</div>
        </div>
      </main>

      <AsideBox />
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  margin-bottom: 16px;
}

.toolbar .count {
  color: var(--bf-text-sub);
  font-size: 13px;
  white-space: nowrap;
}

/* ---------- 翻页（玻璃页码） ---------- */
.list-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 24px;
}

.lp-btn {
  min-width: 42px;
  height: 42px;
  padding: 0 14px;
  border: 1px solid var(--bf-card-border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(16px) saturate(1.5);
  -webkit-backdrop-filter: blur(16px) saturate(1.5);
  color: var(--bf-text);
  font-size: 13.5px;
  font-family: var(--bf-font-ui);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  box-shadow: var(--bf-shadow);
  transition: all 0.25s cubic-bezier(0.22, 0.61, 0.36, 1);
}

html.dark .lp-btn {
  background: rgba(25, 27, 32, 0.74);
}

.lp-btn.num {
  padding: 0;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.lp-btn:hover:not(:disabled):not(.active) {
  border-color: var(--bf-primary);
  color: var(--bf-primary);
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(73, 177, 245, 0.22);
}

.lp-btn.active {
  background: linear-gradient(135deg, var(--bf-primary), #6fc3f7);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 6px 16px rgba(73, 177, 245, 0.4);
  transform: translateY(-2px);
}

.lp-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.lp-ell {
  color: var(--bf-text-light);
  padding: 0 2px;
}

.list-end {
  text-align: center;
  width: 100%;
  color: var(--bf-text-light);
  font-size: 13px;
  padding: 14px 0 4px;
  letter-spacing: 1px;
}
</style>
