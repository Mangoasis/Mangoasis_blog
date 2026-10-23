<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageBanner from '../components/PageBanner.vue'
import AsideBox from '../components/AsideBox.vue'
import { siteStore } from '../stores/site'
import { talks, addTalk, likeTalk, commentTalk, deleteTalk } from '../stores/social'
import { isLoggedIn } from '../stores/auth'
import { fileToDataUrl } from '../stores/gallery'

const router = useRouter()

const content = ref('')
const images = ref([])
const commenting = ref(null)
const commentText = ref('')
const fileInput = ref(null)
const uploading = ref(false)

/** 发布 / 删除需要登录（随笔为站长记录） */
function requireAuth(action = '发布随笔') {
  if (isLoggedIn()) return true
  ElMessage.warning(`请先登录后再${action}`)
  router.push({ path: '/login', query: { redirect: '/talk' } })
  return false
}

function chooseImages() {
  if (!requireAuth('上传配图')) return
  fileInput.value?.click()
}

async function onFiles(e) {
  const files = Array.from(e.target.files || [])
  e.target.value = ''
  if (!files.length) return
  if (images.value.length + files.length > 4) {
    ElMessage.warning('最多搭配 4 张图片')
    return
  }
  uploading.value = true
  for (const f of files) {
    if (f.size > 1.5 * 1024 * 1024) {
      ElMessage.warning(`「${f.name}」超过 1.5MB，请压缩后再试`)
      continue
    }
    images.value.push(await fileToDataUrl(f))
  }
  uploading.value = false
}

function removeImage(i) {
  images.value.splice(i, 1)
}

function publish() {
  if (!requireAuth()) return
  if (!content.value.trim() && !images.value.length) {
    ElMessage.warning('写点文字或配张图片再发布吧~')
    return
  }
  addTalk(content.value.trim(), images.value)
  content.value = ''
  images.value = []
  ElMessage.success('随笔已发布')
}

function submitComment(id) {
  if (!commentText.value.trim()) return
  commentTalk(id, '游客', commentText.value.trim())
  commentText.value = ''
  commenting.value = null
  ElMessage.success('评论成功')
}

async function onDelete(id) {
  if (!requireAuth('删除随笔')) return
  try {
    await ElMessageBox.confirm('确定删除这条随笔吗？', '提示', { type: 'warning' })
    deleteTalk(id)
    ElMessage.success('已删除')
  } catch (e) {
    /* 取消 */
  }
}
</script>

<template>
  <div>
    <PageBanner title="随笔" subtitle="随手记下此刻的想法与画面" />

    <div class="bf-container">
      <main class="bf-main">
        <!-- 发布框（登录后可用） -->
        <div class="bf-card publish-card" v-reveal>
          <div class="publish-head">
            <img :src="siteStore.author.avatar" alt="avatar" />
            <div class="publish-who">
              <span>{{ siteStore.author.name }}</span>
              <small v-if="!isLoggedIn">未登录 · 登录后可发布随笔</small>
              <small v-else>记录此刻的想法</small>
            </div>
          </div>
          <el-input
            v-model="content"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            placeholder="这一刻的想法..."
            class="publish-input"
          />

          <!-- 配图预览 -->
          <div v-if="images.length" class="img-previews">
            <div v-for="(img, i) in images" :key="i" class="img-preview">
              <img :src="img" alt="配图" />
              <button class="img-remove" title="移除" @click="removeImage(i)">
                <el-icon :size="13"><Close /></el-icon>
              </button>
            </div>
          </div>

          <div class="publish-actions">
            <el-button text :disabled="uploading" @click="chooseImages">
              <el-icon style="margin-right: 4px"><Picture /></el-icon>
              {{ uploading ? '读取中...' : '添加配图（≤4张）' }}
            </el-button>
            <el-button type="primary" round @click="publish">
              <el-icon style="margin-right: 4px"><Promotion /></el-icon>发布
            </el-button>
          </div>
          <input ref="fileInput" type="file" accept="image/*" multiple style="display: none" @change="onFiles" />
        </div>

        <!-- 随笔列表 -->
        <div v-for="(t, i) in talks" :key="t.id" class="bf-card talk-card" v-reveal="(i % 6) * 60">
          <div class="talk-head">
            <img :src="siteStore.author.avatar" alt="avatar" />
            <div class="who">
              <div class="name">{{ siteStore.author.name }}</div>
              <div class="date">{{ t.date }}</div>
            </div>
            <el-button class="del" text size="small" type="danger" @click="onDelete(t.id)">删除</el-button>
          </div>
          <p v-if="t.content" class="talk-content">{{ t.content }}</p>

          <!-- 配图 -->
          <div v-if="t.images && t.images.length" class="talk-imgs" :class="'n' + Math.min(t.images.length, 3)">
            <el-image
              v-for="(img, j) in t.images"
              :key="j"
              :src="img"
              :preview-src-list="t.images"
              :initial-index="j"
              fit="cover"
              loading="lazy"
              preview-teleported
              class="talk-img"
            >
              <template #placeholder>
                <div class="img-skeleton"></div>
              </template>
            </el-image>
          </div>

          <div class="talk-actions">
            <el-button text size="small" @click="likeTalk(t.id)">
              <el-icon style="margin-right: 3px"><Star /></el-icon>{{ t.likes }}
            </el-button>
            <el-button text size="small" @click="commenting = commenting === t.id ? null : t.id">
              <el-icon style="margin-right: 3px"><ChatDotRound /></el-icon>{{ t.comments.length }}
            </el-button>
          </div>

          <!-- 评论区 -->
          <div v-if="t.comments.length" class="talk-comments">
            <div v-for="(c, j) in t.comments" :key="j" class="comment-item">
              <b>{{ c.name }}：</b>{{ c.content }}
            </div>
          </div>

          <div v-if="commenting === t.id" class="comment-input">
            <el-input v-model="commentText" size="small" placeholder="友善评论..." @keyup.enter="submitComment(t.id)" />
            <el-button size="small" type="primary" @click="submitComment(t.id)">发送</el-button>
          </div>
        </div>

        <el-empty v-if="!talks.length" description="还没有随笔，登录后写下第一条吧" />
      </main>

      <AsideBox />
    </div>
  </div>
</template>

<style scoped>
.publish-card,
.talk-card {
  padding: 18px 20px;
  margin-bottom: 16px;
}

.publish-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.publish-head img,
.talk-head img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.publish-who {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.publish-who span {
  font-weight: 600;
  color: var(--bf-text);
}

.publish-who small {
  font-size: 12px;
  color: var(--bf-text-light);
}

.publish-input :deep(.el-textarea__inner) {
  background: var(--bf-input-bg);
}

.img-previews {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 10px;
}

.img-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
}

.img-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.img-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.img-remove:hover {
  background: var(--bf-hover);
}

.publish-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.publish-actions .el-button--primary {
  margin-left: 0;
}

.talk-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.talk-head .who {
  flex: 1;
}

.talk-head .name {
  font-weight: 600;
  color: var(--bf-text);
  font-size: 15px;
}

.talk-head .date {
  color: var(--bf-text-light);
  font-size: 12.5px;
}

.talk-head .del {
  opacity: 0;
  transition: opacity 0.2s;
}

.talk-card:hover .del {
  opacity: 1;
}

.talk-content {
  margin: 12px 0 6px;
  line-height: 1.8;
  color: var(--bf-text);
  white-space: pre-wrap;
  word-break: break-word;
}

/* 配图展示：以图为主 */
.talk-imgs {
  display: grid;
  gap: 8px;
  margin: 10px 0 4px;
}

.talk-imgs.n1 {
  grid-template-columns: 1fr;
}

.talk-imgs.n1 .talk-img {
  height: 300px;
  border-radius: 10px;
}

.talk-imgs.n2 {
  grid-template-columns: repeat(2, 1fr);
}

.talk-imgs.n3 {
  grid-template-columns: repeat(3, 1fr);
}

.talk-img {
  width: 100%;
  height: 150px;
  border-radius: 8px;
  cursor: zoom-in;
}

.talk-actions {
  display: flex;
  gap: 8px;
}

.talk-comments {
  margin-top: 10px;
  padding: 10px 14px;
  background: var(--bf-tag-bg);
  border-radius: 8px;
}

.comment-item {
  font-size: 13.5px;
  color: var(--bf-text-sub);
  line-height: 1.9;
}

.comment-item b {
  color: var(--bf-primary);
}

.comment-input {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
</style>
