<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import TyporaEditor from '../components/TyporaEditor.vue'
import { siteStore } from '../stores/site'
import {
  posts,
  publishedPosts,
  draftPosts,
  getPost,
  savePost,
  deletePost,
  exportMarkdown,
  exportAll,
  importJson,
  parseMarkdownFile,
  categories as allCategories,
  tags as allTags
} from '../stores/posts'

const route = useRoute()
const router = useRouter()

/* ---------- 表单 ---------- */
const form = reactive({
  id: '',
  title: '',
  slug: '',
  category: '未分类',
  tags: [],
  cover: '',
  summary: '',
  content: '',
  status: 'draft',
  top: false
})

const saveState = ref('') // 'saved' | 'dirty' | ''
const lastSaved = ref('')
const isMobile = ref(window.innerWidth < 768)

// 程序化回写 form 字段时抑制 watcher，避免触发多余的自动保存
let suppressWatch = false

function onResize() {
  isMobile.value = window.innerWidth < 768
}

/* ---------- 加载已有文章（#/write?id=xxx） ---------- */
function loadPost(id) {
  const p = getPost(id)
  if (!p) {
    ElMessage.error('文章不存在')
    return
  }
  suppressWatch = true
  Object.assign(form, JSON.parse(JSON.stringify(p)))
  setTimeout(() => (suppressWatch = false), 0)
  saveState.value = 'saved'
}

if (route.query.id) loadPost(String(route.query.id))

/* ---------- 自动保存 ---------- */
let autoTimer = null

function stamp() {
  const d = new Date()
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':')
}function doSave(status) {
  if (!form.title.trim() && !form.content.trim()) {
    ElMessage.warning('请输入标题或正文')
    return null
  }
  if (!form.title.trim()) form.title = '无标题文章'
  form.status = status
  const saved = savePost({ ...form })
  suppressWatch = true
  form.id = saved.id
  form.updated = saved.updated
  setTimeout(() => (suppressWatch = false), 0)
  saveState.value = 'saved'
  lastSaved.value = stamp()
  return saved
}

async function publish() {
  if (!form.title.trim()) {
    ElMessage.warning('请先填写标题')
    return
  }
  const saved = doSave('published')
  if (!saved) return
  ElMessage.success('发布成功！')
  try {
    await ElMessageBox.confirm('文章已发布，是否立即查看？', '发布成功', {
      confirmButtonText: '立即查看',
      cancelButtonText: '留在本页',
      type: 'success'
    })
    router.push(`/article/${saved.id}`)
  } catch (e) {
    /* 留在本页继续编辑 */
  }
}

function saveDraft() {
  if (doSave('draft')) ElMessage.success('已保存到草稿')
}

function toDraft() {
  if (doSave('draft')) ElMessage.success('已转为草稿（前台不再展示）')
}

// 保存时回写 form 字段会再次触发 watcher，已在 doSave 中用 suppressWatch 抑制
watch(
  () => ({ ...form }),
  () => {
    if (suppressWatch) return
    saveState.value = 'dirty'
    clearTimeout(autoTimer)
    autoTimer = setTimeout(() => {
      // 标题和正文都为空时不自动保存
      if (form.title.trim() || form.content.trim()) doSave(form.status || 'draft')
    }, 1500)
  },
  { deep: true }
)

onMounted(() => {
  window.addEventListener('resize', onResize)
  window.addEventListener('keydown', onSaveKey)
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onSaveKey)
  clearTimeout(autoTimer)
  // 离开页面前兜底保存
  if (saveState.value === 'dirty' && (form.title.trim() || form.content.trim())) doSave(form.status || 'draft')
})

/* ---------- 编辑器配置 ---------- */
const theme = computed(() => (siteStore.dark ? 'dark' : 'light'))
const wordCount = computed(() => form.content.replace(/\s/g, '').length)

/* ---------- 封面预设 ---------- */
const presets = [
  'linear-gradient(135deg, #49b1f5 0%, #9ac8e2 100%)',
  'linear-gradient(135deg, #ff7242 0%, #fcc8c8 100%)',
  'linear-gradient(135deg, #6f42c1 0%, #bba8ff 100%)',
  'linear-gradient(135deg, #00b96b 0%, #a8e6c1 100%)',
  'linear-gradient(135deg, #ffd166 0%, #ffe8a3 100%)',
  'linear-gradient(135deg, #f759ab 0%, #ffc2d4 100%)'
]

/** 简笔画封面（自带动画） */
const doodleCovers = [
  { label: '晴日', src: './img/covers/sunny.svg' },
  { label: '月夜', src: './img/covers/moon.svg' },
  { label: '山峦', src: './img/covers/mountains.svg' },
  { label: '咖啡', src: './img/covers/coffee.svg' },
  { label: '小猫', src: './img/covers/cat.svg' },
  { label: '流星', src: './img/covers/star.svg' },
  { label: '绿植', src: './img/covers/plant.svg' },
  { label: '气球', src: './img/covers/balloon.svg' }
]

/* Ctrl+S 快速保存草稿 */
function onSaveKey(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault()
    saveDraft()
  }
}

const coverPreview = computed(() => {
  const c = (form.cover || '').trim()
  if (!c) return { background: presets[0] }
  if (c.startsWith('linear-gradient') || c.startsWith('#') || c.startsWith('rgb')) return { background: c }
  return { backgroundImage: `url("${c}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
})

function autoSummary() {
  form.summary = form.content
    .replace(/[#>*`~\-\[\]()!|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100)
}

/* ---------- 我的文章 ---------- */
const drawer = ref(false)
const drawer2 = ref(false)

function editPost(p) {
  drawer.value = false
  router.replace({ path: '/write', query: { id: p.id } })
  loadPost(p.id)
}

async function removePost(p) {
  try {
    await ElMessageBox.confirm(`确定删除「${p.title}」吗？此操作不可恢复。`, '删除文章', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    deletePost(p.id)
    if (form.id === p.id) {
      // 删除的是当前编辑的文章，重置表单
      suppressWatch = true
      Object.assign(form, { id: '', title: '', slug: '', category: '未分类', tags: [], cover: '', summary: '', content: '', status: 'draft', top: false })
      setTimeout(() => (suppressWatch = false), 0)
      saveState.value = ''
    }
    ElMessage.success('已删除')
  } catch (e) {
    /* 取消 */
  }
}

function newPost() {
  if (saveState.value === 'dirty') doSave(form.status || 'draft')
  router.replace({ path: '/write' })
  suppressWatch = true
  Object.assign(form, { id: '', title: '', slug: '', category: '未分类', tags: [], cover: '', summary: '', content: '', status: 'draft', top: false })
  setTimeout(() => (suppressWatch = false), 0)
  saveState.value = ''
  lastSaved.value = ''
}

/* ---------- 导入导出 ---------- */
const fileInput = ref(null)

function triggerImport() {
  fileInput.value?.click()
}

function onImportFile(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const text = String(reader.result || '')
    try {
      if (file.name.endsWith('.json')) {
        const { added, updated } = importJson(text)
        ElMessage.success(`导入完成：新增 ${added} 篇，更新 ${updated} 篇`)
      } else {
        const data = parseMarkdownFile(text, file.name)
        Object.assign(form, data)
        saveState.value = 'dirty'
        ElMessage.success(`已导入「${file.name}」，记得保存哦`)
      }
    } catch (err) {
      ElMessage.error('导入失败：' + err.message)
    }
  }
  reader.readAsText(file, 'utf-8')
}

function exportCurrent() {
  if (!form.title.trim()) {
    ElMessage.warning('请先填写标题')
    return
  }
  exportMarkdown({ ...form })
}

const categoryOptions = computed(() => allCategories.value.map((c) => c.name))
const tagOptions = computed(() => allTags.value.map((t) => t.name))
</script>

<template>
  <div class="write-page">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="row-1">
        <el-button text circle @click="router.push('/home')" title="返回首页">
          <el-icon :size="20"><ArrowLeft /></el-icon>
        </el-button>
        <input v-model="form.title" class="title-input" placeholder="请输入文章标题..." maxlength="60" />
        <el-tag :type="form.status === 'published' ? 'success' : 'info'" size="small" effect="plain" class="status-tag">
          {{ form.status === 'published' ? '已发布' : '草稿' }}
        </el-tag>
        <span class="save-state" :class="saveState">
          <i class="dot"></i>
          {{ saveState === 'saved' ? `已保存 ${lastSaved}` : saveState === 'dirty' ? '编辑中，自动保存...' : '未保存' }}
        </span>
      </div>

      <div class="row-2">
        <div class="left-actions">
          <el-button size="small" @click="newPost">
            <el-icon><Plus /></el-icon>&nbsp;新建
          </el-button>
          <el-button size="small" @click="drawer = true">
            <el-icon><Folder /></el-icon>&nbsp;我的文章
          </el-button>
          <el-button size="small" @click="triggerImport">
            <el-icon><Upload /></el-icon>&nbsp;导入
          </el-button>
          <el-button size="small" @click="exportCurrent">
            <el-icon><Download /></el-icon>&nbsp;导出md
          </el-button>
          <el-button size="small" title="导出全部文章备份" @click="exportAll">
            <el-icon><Suitcase /></el-icon>&nbsp;备份
          </el-button>
          <span class="word-count" v-if="!isMobile">字数 {{ wordCount }}</span>
        </div>

        <div class="right-actions">
          <el-button v-if="form.status === 'published'" size="small" round @click="toDraft">转为草稿</el-button>
          <el-button size="small" round @click="saveDraft">
            <el-icon><DocumentChecked /></el-icon>&nbsp;存草稿
          </el-button>
          <el-button type="primary" round @click="publish">
            <el-icon><Promotion /></el-icon>&nbsp;{{ form.status === 'published' ? '更新发布' : '发布' }}
          </el-button>
        </div>
      </div>
      <input ref="fileInput" type="file" accept=".md,.markdown,.txt,.json" style="display: none" @change="onImportFile" />
    </div>

    <!-- 主体：编辑器 + 设置面板 -->
    <div class="write-body">
      <div class="editor-wrap">
        <TyporaEditor
          v-model="form.content"
          :theme="theme"
          placeholder="开始书写你的文章吧... 像 Typora 一样，输入 Markdown 即时渲染"
        />
      </div>

      <!-- 桌面端侧栏设置 -->
      <aside class="settings bf-card">
        <div class="settings-inner">
          <h3>文章设置</h3>

          <label class="field-label">分类</label>
          <el-select v-model="form.category" filterable allow-create default-first-option placeholder="选择或输入新分类">
            <el-option v-for="c in categoryOptions" :key="c" :label="c" :value="c" />
          </el-select>

          <label class="field-label">标签</label>
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入新标签"
          >
            <el-option v-for="t in tagOptions" :key="t" :label="t" :value="t" />
          </el-select>

          <label class="field-label">路径 (slug)</label>
          <el-input v-model="form.slug" placeholder="url-slug（可选）" />

          <label class="field-label">封面</label>
          <div class="cover-preview" :style="coverPreview"></div>

          <div class="cover-grid">
            <button
              v-for="d in doodleCovers"
              :key="d.src"
              class="cover-thumb"
              :class="{ active: form.cover === d.src }"
              :title="d.label"
              @click="form.cover = d.src"
            >
              <img :src="d.src" :alt="d.label" loading="lazy" />
            </button>
          </div>

          <div class="preset-row">
            <div
              v-for="(p, i) in presets"
              :key="i"
              class="preset"
              :style="{ background: p }"
              :class="{ active: form.cover === p }"
              @click="form.cover = p"
            ></div>
          </div>
          <div class="cover-custom">
            <el-input v-model="form.cover" placeholder="或输入图片链接 / 渐变CSS" clearable size="small" />
            <el-button text size="small" type="danger" @click="form.cover = ''">清除</el-button>
          </div>

          <label class="field-label">
            摘要
            <el-button text size="small" type="primary" @click="autoSummary">从正文生成</el-button>
          </label>
          <el-input v-model="form.summary" type="textarea" :rows="3" maxlength="120" show-word-limit />

          <div class="switch-row">
            <span>置顶文章</span>
            <el-switch v-model="form.top" />
          </div>
        </div>
      </aside>
    </div>

    <!-- 移动端：设置按钮 -->
    <div v-if="isMobile" class="mobile-settings-fab" @click="drawer2 = true">…</div>

    <!-- 移动端设置抽屉 -->
    <el-drawer v-model="drawer2" title="文章设置" size="85%" direction="btt">
      <div class="mobile-settings">
        <label class="field-label">分类</label>
        <el-select v-model="form.category" filterable allow-create placeholder="选择或输入新分类">
          <el-option v-for="c in categoryOptions" :key="c" :label="c" :value="c" />
        </el-select>
        <label class="field-label">标签</label>
        <el-select v-model="form.tags" multiple filterable allow-create placeholder="选择或输入新标签">
          <el-option v-for="t in tagOptions" :key="t" :label="t" :value="t" />
        </el-select>
        <label class="field-label">摘要</label>
        <el-input v-model="form.summary" type="textarea" :rows="3" maxlength="120" show-word-limit />
        <div class="cover-preview" :style="coverPreview"></div>
        <div class="cover-grid compact">
          <button
            v-for="d in doodleCovers"
            :key="d.src"
            class="cover-thumb"
            :class="{ active: form.cover === d.src }"
            :title="d.label"
            @click="form.cover = d.src"
          >
            <img :src="d.src" :alt="d.label" loading="lazy" />
          </button>
        </div>
        <div class="preset-row">
          <div
            v-for="(p, i) in presets"
            :key="i"
            class="preset"
            :style="{ background: p }"
            :class="{ active: form.cover === p }"
            @click="form.cover = p"
          ></div>
        </div>
        <div class="switch-row">
          <span>置顶文章</span>
          <el-switch v-model="form.top" />
        </div>
      </div>
    </el-drawer>

    <!-- 我的文章抽屉 -->
    <el-drawer v-model="drawer" title="我的文章" size="min(420px, 92%)">
      <div class="my-posts">
        <template v-if="draftPosts.length">
          <div class="group-title">草稿箱（{{ draftPosts.length }}）</div>
          <div v-for="p in draftPosts" :key="p.id" class="my-post-item">
            <div class="info" @click="editPost(p)">
              <div class="t">{{ p.title }}</div>
              <div class="d">更新于 {{ p.updated }}</div>
            </div>
            <el-button text size="small" @click="exportMarkdown(p)">导出</el-button>
            <el-button text size="small" type="danger" @click="removePost(p)">删除</el-button>
          </div>
        </template>

        <div class="group-title">已发布（{{ publishedPosts.length }}）</div>
        <div v-for="p in publishedPosts" :key="p.id" class="my-post-item">
          <div class="info" @click="editPost(p)">
            <div class="t">{{ p.top ? '📌 ' : '' }}{{ p.title }}</div>
            <div class="d">{{ p.date }}</div>
          </div>
          <el-button text size="small" @click="exportMarkdown(p)">导出</el-button>
          <el-button text size="small" type="danger" @click="removePost(p)">删除</el-button>
        </div>
        <el-empty v-if="!posts.length" description="还没有文章" />
      </div>
    </el-drawer>
  </div>
</template>

<script>
export default { name: 'WritePage' }
</script>

<style scoped>
.write-page {
  min-height: 100vh;
  padding-top: 60px;
  display: flex;
  flex-direction: column;
  position: relative;
  /* 聚焦写作：纯色背景（不用壁纸），顶部一层主题色柔光 */
  background: var(--bf-bg);
}

.write-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 280px;
  background: radial-gradient(640px 220px at 28% 0%, rgba(73, 177, 245, 0.14), transparent),
    radial-gradient(520px 200px at 78% 0%, rgba(255, 159, 67, 0.08), transparent);
  pointer-events: none;
}

/* ---------- 工具栏 ---------- */
.toolbar {
  position: sticky;
  top: 60px;
  z-index: 50;
  background: var(--bf-nav-bg);
  backdrop-filter: blur(8px);
  padding: 10px 16px 8px;
  border-bottom: 1px solid var(--bf-card-border);
}

.row-1 {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  border-bottom: 2px solid transparent;
  padding: 4px 0;
  transition: border-color 0.25s;
  font-size: 19px;
  font-weight: 700;
  color: var(--bf-text);
}

.title-input:focus {
  border-bottom-color: rgba(73, 177, 245, 0.55);
}

.title-input::placeholder {
  color: var(--bf-text-light);
  font-weight: 400;
}

.save-state {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 11px;
  border-radius: 12px;
  font-size: 12px;
  white-space: nowrap;
  color: var(--bf-text-light);
  background: var(--bf-tag-bg);
  transition: all 0.25s;
}

.save-state .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.save-state.saved {
  color: var(--el-color-success);
  background: rgba(103, 194, 58, 0.12);
}

.save-state.dirty {
  color: var(--el-color-warning);
  background: rgba(230, 162, 60, 0.14);
  animation: savePulse 1.6s ease infinite;
}

@keyframes savePulse {
  50% {
    opacity: 0.55;
  }
}

.row-2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.left-actions,
.right-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.word-count {
  font-size: 12.5px;
  color: var(--bf-text-light);
  margin-left: 6px;
  white-space: nowrap;
}

/* ---------- 主体 ---------- */
.write-body {
  flex: 1;
  display: flex;
  align-items: stretch;
  min-height: 0;
}

.editor-wrap {
  flex: 1;
  min-width: 0;
  height: calc(100vh - 150px);
  margin: 0 0 0 12px;
  border-radius: var(--bf-radius-lg);
  overflow: hidden;
  border: 1px solid var(--bf-card-border);
  box-shadow: var(--bf-shadow);
  background: var(--bf-card-bg);
}

.settings {
  width: 290px;
  flex-shrink: 0;
  margin: 12px 12px 12px 0;
  position: sticky;
  top: 132px;
  max-height: calc(100vh - 160px);
  overflow-y: auto;
}

.settings-inner {
  padding: 18px 16px;
}

.settings-inner h3 {
  margin: 0 0 14px;
  font-size: 16px;
  color: var(--bf-text);
}

.field-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--bf-text-sub);
  margin: 14px 0 6px;
}

.cover-preview {
  height: 96px;
  border-radius: 8px;
  background: var(--bf-primary);
  background-size: cover;
  background-position: center;
  margin-bottom: 10px;
  box-shadow: var(--bf-shadow);
}

/* 简笔画封面缩略图网格 */
.cover-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 7px;
  margin-bottom: 10px;
}

.cover-grid.compact {
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.cover-thumb {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 7px;
  overflow: hidden;
  border: 2px solid transparent;
  padding: 0;
  cursor: pointer;
  background: var(--bf-tag-bg);
  transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s;
}

.cover-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-thumb:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.cover-thumb.active {
  border-color: var(--bf-hover);
  box-shadow: 0 0 0 2px rgba(255, 114, 66, 0.35);
}

.cover-custom {
  display: flex;
  gap: 6px;
  align-items: center;
}

.preset-row {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.preset {
  width: 28px;
  height: 20px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.15s;
}

.preset:hover {
  transform: translateY(-2px);
}

.preset.active {
  border-color: var(--bf-hover);
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed var(--bf-card-border);
  font-size: 14px;
  color: var(--bf-text);
}

@media (max-width: 900px) {
  .settings {
    display: none;
  }

  .editor-wrap {
    height: calc(100vh - 148px);
  }
}

/* ---------- 移动端设置按钮 ---------- */
.mobile-settings-fab {
  position: fixed;
  left: 14px;
  bottom: 96px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bf-card-bg);
  color: var(--bf-text-sub);
  box-shadow: var(--bf-shadow);
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  z-index: 90;
  cursor: pointer;
  user-select: none;
}

@media (max-width: 900px) {
  .mobile-settings-fab {
    display: flex;
  }
}

.mobile-settings {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 20px;
}

/* ---------- 我的文章 ---------- */
.group-title {
  font-size: 13.5px;
  color: var(--bf-text-sub);
  font-weight: 700;
  margin: 6px 0 8px;
}

.my-post-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.my-post-item:hover {
  background: var(--bf-tag-bg);
}

.my-post-item .info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.my-post-item .t {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--bf-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.my-post-item .d {
  font-size: 12px;
  color: var(--bf-text-light);
  margin-top: 2px;
}
</style>
