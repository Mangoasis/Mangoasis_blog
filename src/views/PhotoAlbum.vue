<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageBanner from '../components/PageBanner.vue'
import AsideBox from '../components/AsideBox.vue'
import { photos, albums, photosOf, addPhoto, deletePhoto, fileToDataUrl } from '../stores/gallery'
import { isLoggedIn } from '../stores/auth'

const route = useRoute()
const router = useRouter()

/** 上传 / 删除需要登录 */
function requireAuth(action = '上传照片') {
  if (isLoggedIn()) return true
  ElMessage.warning(`请先登录后再${action}`)
  router.push({ path: '/login', query: { redirect: '/photoAlbum' } })
  return false
}

/* ---------- 翻页 ---------- */
const PAGE_SIZE = 12
const page = ref(1)
const activeAlbum = ref('全部')
const showAdd = ref(false)
const addForm = ref({ album: '', src: '', title: '', desc: '', mode: 'url' })
const addFileInput = ref(null)

const fullList = computed(() => photosOf(activeAlbum.value))
const list = computed(() => fullList.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
const previewList = computed(() => fullList.value.map((p) => p.src))
const pageCount = computed(() => Math.max(1, Math.ceil(fullList.value.length / PAGE_SIZE)))

watch(
  () => route.query.album,
  (a) => {
    if (a && albums.value.some((x) => x.name === a)) activeAlbum.value = a
  },
  { immediate: true }
)

watch(activeAlbum, () => (page.value = 1))

function goPage(p) {
  page.value = p
  nextTick(() => {
    const grid = document.querySelector('.photo-grid')
    if (grid) window.scrollTo({ top: grid.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' })
  })
}

function chooseFile() {
  addFileInput.value?.click()
}

async function onFile(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  if (file.size > 1.5 * 1024 * 1024) {
    ElMessage.warning('图片过大（>1.5MB），localStorage 可能存不下，请压缩后再试')
    return
  }
  addForm.value.src = await fileToDataUrl(file)
  ElMessage.success('图片已读取')
}

function submitAdd() {
  if (!requireAuth()) return
  const { album, src, title, desc } = addForm.value
  if (!album.trim()) {
    ElMessage.warning('请填写相册名')
    return
  }
  if (!src.trim()) {
    ElMessage.warning('请提供图片链接或选择本地图片')
    return
  }
  addPhoto({ album: album.trim(), src: src.trim(), title: title.trim(), desc: (desc || '').trim() })
  showAdd.value = false
  addForm.value = { album: '', src: '', title: '', desc: '', mode: 'url' }
  ElMessage.success('照片已添加')
}

async function onDelete(p) {
  if (!requireAuth('删除照片')) return
  try {
    await ElMessageBox.confirm(`删除照片「${p.title}」？`, '提示', { type: 'warning' })
    deletePhoto(p.id)
    ElMessage.success('已删除')
  } catch (e) {
    /* 取消 */
  }
}
</script>

<template>
  <div>
    <PageBanner title="相册" subtitle="用镜头记录生活的美好瞬间" />

    <div class="bf-container">
      <main class="bf-main">
        <div class="bf-card album-card" v-reveal>
          <!-- 相册筛选 -->
          <div class="album-filter">
            <button
              v-for="a in albums"
              :key="a.name"
              class="album-chip"
              :class="{ active: activeAlbum === a.name }"
              @click="activeAlbum = a.name"
            >
              {{ a.name }}
              <span class="num">{{ a.count }}</span>
            </button>
            <el-button class="bf-write-btn add-btn" size="small" round @click="requireAuth() && (showAdd = true)">
              <el-icon style="margin-right: 4px"><Plus /></el-icon>添加照片
            </el-button>
          </div>

          <!-- 照片网格（瀑布流 + 文字常显） -->
          <div class="photo-grid">
            <div v-for="(p, i) in list" :key="p.id" class="photo-item" v-reveal="(i % 9) * 50">
              <el-image
                :src="p.src"
                :preview-src-list="previewList"
                :initial-index="fullList.indexOf(p)"
                fit="cover"
                loading="lazy"
                preview-teleported
                class="photo-img"
              >
                <template #placeholder>
                  <div class="img-skeleton"></div>
                </template>
                <template #error>
                  <div class="img-error"><el-icon :size="26"><PictureFilled /></el-icon></div>
                </template>
              </el-image>

              <!-- 文字信息：常驻显示，无需悬停 -->
              <div class="photo-caption">
                <div class="cap-text">
                  <span class="c-title">{{ p.title }}</span>
                  <span v-if="p.desc" class="c-desc">{{ p.desc }}</span>
                </div>
                <div class="cap-foot">
                  <span class="c-date">{{ p.album }} · {{ p.date }}</span>
                  <button class="c-del" title="删除" @click.stop="onDelete(p)">
                    <el-icon :size="13"><Delete /></el-icon>
                  </button>
                </div>
              </div>

              <!-- 移动端：右上角小删除按钮 -->
              <button class="p-del-top" title="删除" @click.stop="onDelete(p)">
                <el-icon :size="13"><Delete /></el-icon>
              </button>
            </div>
          </div>

          <!-- 翻页 -->
          <div v-if="pageCount > 1" class="pager">
            <button class="pg-btn nav" :disabled="page <= 1" @click="goPage(page - 1)">
              <el-icon><ArrowLeft /></el-icon>上一页
            </button>
            <button
              v-for="p in pageCount"
              :key="p"
              class="pg-btn num"
              :class="{ active: p === page }"
              @click="goPage(p)"
            >
              {{ p }}
            </button>
            <button class="pg-btn nav" :disabled="page >= pageCount" @click="goPage(page + 1)">
              下一页<el-icon><ArrowRight /></el-icon>
            </button>
          </div>

          <el-empty v-if="!list.length" description="这个相册还没有照片" />
        </div>
      </main>

      <AsideBox />
    </div>

    <!-- 添加照片对话框 -->
    <el-dialog v-model="showAdd" title="添加照片" width="min(480px, 92%)" :close-on-click-modal="false">
      <el-form label-position="top">
        <el-form-item label="所属相册" required>
          <el-input v-model="addForm.album" placeholder="相册名（如：风景 / 生活，可新建）" maxlength="12">
            <template #append>
              <el-select
                v-model="addForm.album"
                placeholder="选择已有"
                style="width: 118px"
                @change="(v) => (addForm.album = v)"
              >
                <el-option v-for="a in albums.filter((x) => x.name !== '全部')" :key="a.name" :label="a.name" :value="a.name" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="照片标题">
          <el-input v-model="addForm.title" placeholder="给照片起个名字（可选）" maxlength="20" />
        </el-form-item>
        <el-form-item label="照片描述">
          <el-input v-model="addForm.desc" type="textarea" :rows="2" placeholder="记录这张照片背后的故事（可选，悬停展示）" maxlength="80" show-word-limit />
        </el-form-item>
        <el-form-item label="图片来源" required>
          <el-radio-group v-model="addForm.mode">
            <el-radio-button value="url">图片链接</el-radio-button>
            <el-radio-button value="local">本地图片</el-radio-button>
          </el-radio-group>
          <div style="width: 100%; margin-top: 10px">
            <el-input v-if="addForm.mode === 'url'" v-model="addForm.src" placeholder="https://... 图片地址" clearable />
            <template v-else>
              <el-button @click="chooseFile">
                <el-icon style="margin-right: 4px"><Upload /></el-icon>选择图片（≤1.5MB，存入浏览器）
              </el-button>
              <el-image
                v-if="addForm.src.startsWith('data:')"
                :src="addForm.src"
                fit="cover"
                style="width: 100%; height: 140px; border-radius: 8px; margin-top: 10px"
              />
            </template>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="primary" @click="submitAdd">添加</el-button>
      </template>
      <input ref="addFileInput" type="file" accept="image/*" style="display: none" @change="onFile" />
    </el-dialog>
  </div>
</template>

<style scoped>
.album-card {
  padding: 20px 22px 24px;
}

.album-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
}

.album-chip {
  border: none;
  cursor: pointer;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13.5px;
  color: var(--bf-text-sub);
  background: var(--bf-tag-bg);
  transition: all 0.25s;
  font-family: var(--bf-font-ui);
}

.album-chip:hover {
  color: var(--bf-primary);
  transform: translateY(-2px);
}

.album-chip.active {
  background: linear-gradient(135deg, var(--bf-primary), #6fc3f7);
  color: #fff;
  box-shadow: 0 3px 10px rgba(73, 177, 245, 0.35);
}

.album-chip .num {
  margin-left: 3px;
  font-size: 12px;
  opacity: 0.8;
}

.add-btn {
  margin-left: auto;
}

/* 桌面端：以图为主的瀑布流 */
.photo-grid {
  display: block;
  columns: 3 280px;
  column-gap: 14px;
}

.photo-item {
  break-inside: avoid;
  margin-bottom: 14px;
  position: relative;
  border-radius: var(--bf-radius);
  overflow: hidden;
  box-shadow: var(--bf-shadow);
  transition: transform 0.3s, box-shadow 0.3s;
}

.photo-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--bf-shadow-hover);
}

.photo-img {
  width: 100%;
  height: auto;
  min-height: 160px;
  display: block;
  cursor: zoom-in;
}

/* 移动端：手机相册式 3 列方图紧凑网格 */
@media (max-width: 900px) {
  .album-card {
    padding: 14px 12px 16px;
  }

  .album-filter {
    gap: 6px;
    margin-bottom: 12px;
  }

  .album-chip {
    padding: 5px 12px;
    font-size: 12.5px;
  }

  .photo-grid {
    columns: auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }

  .photo-item {
    margin-bottom: 0;
  }

  .photo-img {
    height: auto;
    aspect-ratio: 1;
    min-height: 0;
  }

  .photo-item {
    border-radius: 8px;
  }

  .photo-item:hover {
    transform: none;
  }
}

.img-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bf-tag-bg);
  color: var(--bf-text-light);
}

/* 文字信息：常驻显示在图片下方 */
.photo-caption {
  padding: 10px 13px 11px;
}

.cap-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 6px;
}

.c-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--bf-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.c-desc {
  font-size: 12px;
  line-height: 1.55;
  color: var(--bf-text-sub);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cap-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.c-date {
  font-size: 11.5px;
  color: var(--bf-text-light);
}

.c-del {
  border: none;
  background: transparent;
  color: var(--bf-text-light);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  opacity: 0;
}

.photo-item:hover .c-del {
  opacity: 1;
}

.c-del:hover {
  color: #fff;
  background: var(--bf-hover);
}

/* 移动端删除按钮常显在图片角上 */
.p-del-top {
  display: none;
}

@media (max-width: 900px) {
  .p-del-top {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 5px;
    right: 5px;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.42);
    color: #fff;
    cursor: pointer;
    backdrop-filter: blur(4px);
    transition: background 0.2s;
    z-index: 2;
  }

  .p-del-top:hover {
    background: var(--bf-hover);
  }

  .c-del {
    display: none;
  }

  .c-desc {
    -webkit-line-clamp: 1;
  }
}

/* ---------- 翻页 ---------- */
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 22px;
}

.pg-btn {
  border: 1px solid var(--bf-card-border);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--bf-text);
  min-width: 38px;
  height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  font-size: 13.5px;
  font-family: var(--bf-font-ui);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  transition: all 0.22s;
}

html.dark .pg-btn {
  background: rgba(25, 27, 32, 0.7);
}

.pg-btn:hover:not(:disabled):not(.active) {
  border-color: var(--bf-primary);
  color: var(--bf-primary);
  transform: translateY(-2px);
}

.pg-btn.active {
  background: linear-gradient(135deg, var(--bf-primary), #6fc3f7);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 12px rgba(73, 177, 245, 0.4);
}

.pg-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
