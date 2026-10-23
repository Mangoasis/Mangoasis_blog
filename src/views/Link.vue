<script setup>
import PageBanner from '../components/PageBanner.vue'
import AsideBox from '../components/AsideBox.vue'
import { siteStore } from '../stores/site'
import { links, addLink } from '../stores/social'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const form = ref({ name: '', desc: '', url: '', avatar: '' })
const showForm = ref(false)

function apply() {
  if (!form.value.name || !form.value.url) {
    ElMessage.warning('请至少填写站点名称和链接')
    return
  }
  addLink({ ...form.value, avatar: form.value.avatar || 'https://vuejs.org/logo.svg' })
  showForm.value = false
  form.value = { name: '', desc: '', url: '', avatar: '' }
  ElMessage.success('友链已添加')
}
</script>

<template>
  <div>
    <PageBanner title="友链" subtitle="海内存知己，天涯若比邻" />

    <div class="bf-container">
      <main class="bf-main">
        <div class="link-grid">
          <a
            v-for="(l, i) in links"
            :key="l.url"
            class="bf-card bf-card-hover link-card" v-reveal="(i % 6) * 70"
            :href="l.url"
            target="_blank"
            rel="noopener"
          >
            <img :src="l.avatar" alt="avatar" @error="(e) => (e.target.style.visibility = 'hidden')" />
            <div class="info">
              <div class="name">{{ l.name }}</div>
              <div class="desc">{{ l.desc }}</div>
            </div>
          </a>
        </div>

        <!-- 申请友链 -->
        <div class="bf-card apply-card" v-reveal>
          <h3>💬 申请友链</h3>
          <p>
            欢迎交换友链！请在下方填写你的站点信息（或直接在留言板留言），格式如下：
          </p>
          <ul class="apply-list">
            <li>站点名称：{{ siteStore.title }}</li>
            <li>站点链接：https://example.com</li>
            <li>站点描述：一句话介绍你的站点</li>
            <li>站点头像：头像或 Logo 地址</li>
          </ul>
          <el-button v-if="!showForm" text type="primary" @click="showForm = true">+ 添加友链</el-button>
          <div v-else class="apply-form">
            <el-input v-model="form.name" placeholder="站点名称（必填）" />
            <el-input v-model="form.url" placeholder="站点链接（必填）" />
            <el-input v-model="form.desc" placeholder="站点描述" />
            <el-input v-model="form.avatar" placeholder="头像链接（可选）" />
            <div class="apply-actions">
              <el-button size="small" @click="showForm = false">取消</el-button>
              <el-button size="small" type="primary" @click="apply">添加</el-button>
            </div>
          </div>
        </div>
      </main>

      <AsideBox />
    </div>
  </div>
</template>

<style scoped>
.link-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .link-grid {
    grid-template-columns: 1fr;
  }
}

.link-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
}

.link-card img {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--bf-tag-bg);
}

.link-card .name {
  font-size: 16px;
  font-weight: 700;
  color: var(--bf-text);
  margin-bottom: 4px;
}

.link-card:hover .name {
  color: var(--bf-primary);
}

.link-card .desc {
  font-size: 13px;
  color: var(--bf-text-sub);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.apply-card {
  padding: 22px 24px;
}

.apply-card h3 {
  margin: 0 0 10px;
  color: var(--bf-text);
}

.apply-card p {
  color: var(--bf-text-sub);
  font-size: 14px;
  margin: 0 0 10px;
}

.apply-list {
  color: var(--bf-text-sub);
  font-size: 13.5px;
  line-height: 2;
  padding-left: 20px;
  margin: 0 0 12px;
}

.apply-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.apply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
