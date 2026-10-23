<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageBanner from '../components/PageBanner.vue'
import { siteStore } from '../stores/site'
import { exportAllData, importAllData, clearData, ALL_DATA_KEYS } from '../stores/backup'
import { posts as postsStore, exportAll, importJson } from '../stores/posts'
import { talks, messages, links } from '../stores/social'
import { photos, resources } from '../stores/gallery'

const posts = postsStore

/* ---------- 站点信息表单 ---------- */
const form = reactive({
  title: siteStore.title,
  subtitle: siteStore.subtitle,
  desc: siteStore.desc,
  announcement: siteStore.announcement,
  avatar: siteStore.author.avatar,
  name: siteStore.author.name,
  motto: siteStore.author.motto
})

const ICON_OPTIONS = [
  'Compass', 'ChatDotRound', 'Message', 'Position', 'Iphone', 'User',
  'Link', 'Comment', 'Promotion', 'Service', 'Headset', 'Monitor',
  'Coin', 'Reading', 'Camera', 'Picture', 'Star', 'Collection'
]

const socials = reactive(siteStore.author.social.map((s) => ({ ...s })))

function addSocial() {
  if (socials.length >= 6) {
    ElMessage.warning('最多 6 个社交链接')
    return
  }
  socials.push({ icon: 'Link', link: 'https://' })
}

function removeSocial(i) {
  socials.splice(i, 1)
}

function saveSettings() {
  // 校验图标名（避免渲染成空白）
  const valid = socials.filter((s) => s.link.trim()).map((s) => ({
    icon: ICON_OPTIONS.includes(s.icon) ? s.icon : 'Link',
    link: s.link.trim()
  }))
  siteStore.title = form.title.trim() || 'Butterfly'
  siteStore.subtitle = form.subtitle.trim()
  siteStore.desc = form.desc.trim()
  siteStore.announcement = form.announcement.trim()
  siteStore.author.avatar = form.avatar.trim() || './img/butterfly-icon.png'
  siteStore.author.name = form.name.trim() || 'Butterfly'
  siteStore.author.motto = form.motto.trim()
  siteStore.author.social = valid
  ElMessage.success('设置已保存')
}

/* ---------- 数据统计 ---------- */
const stats = [
  { label: '文章', value: posts.length },
  { label: '说说', value: talks.length },
  { label: '留言', value: messages.length },
  { label: '友链', value: links.length },
  { label: '照片', value: photos.length },
  { label: '资源', value: resources.length }
]

/* ---------- 备份 ---------- */
const importInput = ref(null)

function onBackupExport() {
  const total = exportAllData()
  ElMessage.success(`已导出全部数据（共 ${total} 项）`)
}

function triggerImport() {
  importInput.value?.click()
}

async function onImportFile(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  const text = String(await file.text())
  try {
    // 全量备份必含文章存储键；否则按旧版单类文章备份处理
    if (file.name.includes('posts-') || !text.includes('"butterfly-blog-posts"')) {
      const { added, updated } = importJson(text)
      ElMessage.success(`文章导入完成：新增 ${added} 篇，更新 ${updated} 篇`)
      return
    }
    await ElMessageBox.confirm(
      '导入全量备份将覆盖当前所有本地数据，确定继续？',
      '恢复备份',
      { type: 'warning', confirmButtonText: '覆盖恢复', cancelButtonText: '取消' }
    )
    const { restored } = importAllData(text)
    ElMessage.success(`恢复完成：${restored.map((r) => `${r.label} ${r.count}`).join('、')}，即将刷新页面`)
    setTimeout(() => location.reload(), 1400)
  } catch (err) {
    if (err !== 'cancel' && err?.message) ElMessage.error('导入失败：' + err.message)
  }
}

/* ---------- 危险区 ---------- */
async function clearPosts() {
  try {
    await ElMessageBox.confirm(`确定清空全部 ${posts.length} 篇文章（含草稿）吗？此操作不可恢复！`, '清空文章', {
      type: 'error',
      confirmButtonText: '清空',
      cancelButtonText: '取消'
    })
    clearData(['butterfly-blog-posts'])
    ElMessage.success('已清空，即将刷新')
    setTimeout(() => location.reload(), 1200)
  } catch (e) {
    /* 取消 */
  }
}

async function clearEverything() {
  try {
    await ElMessageBox.confirm(
      '将清空文章、说说、留言、友链、照片、资源等全部本地数据（保留主题设置），确定吗？',
      '重置站点',
      { type: 'error', confirmButtonText: '全部清空', cancelButtonText: '取消' }
    )
    clearData(ALL_DATA_KEYS)
    ElMessage.success('站点数据已重置，即将刷新')
    setTimeout(() => location.reload(), 1200)
  } catch (e) {
    /* 取消 */
  }
}
</script>

<template>
  <div>
    <PageBanner title="个人中心" subtitle="站点设置与数据管理" />

    <div class="bf-container">
      <main class="bf-main">
        <!-- 站点信息 -->
        <div class="bf-card uc-card" v-reveal>
          <h3 class="uc-title"><el-icon><Setting /></el-icon>站点信息</h3>
          <div class="uc-grid">
            <div class="field">
              <label>站点名称</label>
              <el-input v-model="form.title" maxlength="20" />
            </div>
            <div class="field">
              <label>副标题 / 签名</label>
              <el-input v-model="form.subtitle" maxlength="30" />
            </div>
            <div class="field wide">
              <label>站点描述（关于页 & 首页展示）</label>
              <el-input v-model="form.desc" type="textarea" :rows="2" maxlength="120" show-word-limit />
            </div>
            <div class="field wide">
              <label>侧边栏公告</label>
              <el-input v-model="form.announcement" type="textarea" :rows="2" maxlength="120" show-word-limit />
            </div>
            <div class="field">
              <label>头像图片地址</label>
              <el-input v-model="form.avatar" placeholder="https://... 或 /img/xx.png" />
            </div>
            <div class="field">
              <label>作者昵称</label>
              <el-input v-model="form.name" maxlength="20" />
            </div>
            <div class="field wide">
              <label>个性签名（作者卡片）</label>
              <el-input v-model="form.motto" maxlength="40" />
            </div>
          </div>

          <!-- 社交链接 -->
          <div class="social-editor">
            <div class="uc-subtitle">
              社交链接
              <el-button text size="small" type="primary" @click="addSocial">+ 添加</el-button>
            </div>
            <div v-for="(s, i) in socials" :key="i" class="social-row">
              <el-select v-model="s.icon" class="icon-select">
                <el-option v-for="ic in ICON_OPTIONS" :key="ic" :label="ic" :value="ic">
                  <span style="display: inline-flex; align-items: center; gap: 8px">
                    <el-icon><component :is="ic" /></el-icon>{{ ic }}
                  </span>
                </el-option>
              </el-select>
              <el-input v-model="s.link" placeholder="链接地址" class="link-input" />
              <el-button text type="danger" circle @click="removeSocial(i)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <div class="save-row">
            <el-button type="primary" round @click="saveSettings">
              <el-icon style="margin-right: 4px"><Check /></el-icon>保存设置
            </el-button>
          </div>
        </div>

        <!-- 数据管理 -->
        <div class="bf-card uc-card" v-reveal="80">
          <h3 class="uc-title"><el-icon><Suitcase /></el-icon>数据管理</h3>
          <div class="stats-grid">
            <div v-for="s in stats" :key="s.label" class="stat-item">
              <div class="num">{{ s.value }}</div>
              <div class="label">{{ s.label }}</div>
            </div>
          </div>
          <p class="uc-tip">所有数据保存在当前浏览器 localStorage。换设备或清理浏览器前，请先导出备份。</p>
          <div class="backup-row">
            <el-button round @click="onBackupExport">
              <el-icon style="margin-right: 4px"><Download /></el-icon>导出全部数据
            </el-button>
            <el-button round @click="triggerImport">
              <el-icon style="margin-right: 4px"><Upload /></el-icon>恢复备份
            </el-button>
            <el-button round @click="exportAll">
              <el-icon style="margin-right: 4px"><Document /></el-icon>仅导出文章 JSON
            </el-button>
          </div>
          <input ref="importInput" type="file" accept=".json" style="display: none" @change="onImportFile" />
        </div>

        <!-- 危险区 -->
        <div class="bf-card uc-card danger" v-reveal="160">
          <h3 class="uc-title"><el-icon><WarningFilled /></el-icon>危险操作</h3>
          <div class="danger-row">
            <div class="danger-info">
              <b>清空文章</b>
              <span>删除全部文章与草稿，不可恢复</span>
            </div>
            <el-button type="danger" plain round @click="clearPosts">清空文章</el-button>
          </div>
          <div class="danger-row">
            <div class="danger-info">
              <b>重置站点</b>
              <span>清空全部本地数据（文章/说说/留言/友链/照片/资源），恢复初始状态</span>
            </div>
            <el-button type="danger" round @click="clearEverything">重置站点</el-button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.uc-card {
  padding: 24px 26px;
  margin-bottom: 18px;
}

.uc-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  margin: 0 0 18px;
  color: var(--bf-text);
}

.uc-title .el-icon {
  color: var(--bf-primary);
}

.uc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
}

.uc-grid .field.wide {
  grid-column: 1 / -1;
}

@media (max-width: 640px) {
  .uc-grid {
    grid-template-columns: 1fr;
  }
}

.field label {
  display: block;
  font-size: 13px;
  color: var(--bf-text-sub);
  margin-bottom: 6px;
}

.uc-subtitle {
  font-size: 14px;
  font-weight: 600;
  color: var(--bf-text);
  margin: 20px 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.social-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.icon-select {
  width: 150px;
  flex-shrink: 0;
}

.link-input {
  flex: 1;
}

.save-row {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.stat-item {
  text-align: center;
  padding: 12px 0;
  border-radius: 10px;
  background: var(--bf-tag-bg);
}

.stat-item .num {
  font-size: 20px;
  font-weight: 700;
  color: var(--bf-primary);
}

.stat-item .label {
  font-size: 12px;
  color: var(--bf-text-sub);
  margin-top: 2px;
}

.uc-tip {
  font-size: 13px;
  color: var(--bf-text-light);
  margin: 14px 0;
}

.backup-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.uc-card.danger {
  border: 1px solid rgba(245, 108, 108, 0.35);
}

.uc-card.danger .uc-title .el-icon {
  color: var(--el-color-danger);
}

.danger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px dashed var(--bf-card-border);
}

.danger-row:last-child {
  border-bottom: none;
  padding-bottom: 4px;
}

.danger-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.danger-info b {
  font-size: 14.5px;
  color: var(--bf-text);
}

.danger-info span {
  font-size: 12.5px;
  color: var(--bf-text-light);
}
</style>
