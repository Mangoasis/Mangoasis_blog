<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageBanner from '../components/PageBanner.vue'
import AsideBox from '../components/AsideBox.vue'
import { siteStore } from '../stores/site'
import { messages, addMessage, replyMessage } from '../stores/social'

const name = ref('')
const content = ref('')
const replying = ref(null)
const replyText = ref('')

function submit() {
  if (!name.value.trim()) {
    ElMessage.warning('请填写昵称')
    return
  }
  if (!content.value.trim()) {
    ElMessage.warning('留言内容不能为空')
    return
  }
  addMessage(name.value.trim(), content.value.trim())
  content.value = ''
  ElMessage.success('留言成功，感谢留言~')
}

function submitReply(id) {
  if (!replyText.value.trim()) return
  replyMessage(id, name.value.trim() || '游客', replyText.value.trim())
  replyText.value = ''
  replying.value = null
  ElMessage.success('回复成功')
}

const colors = ['#49b1f5', '#ff7242', '#6f42c1', '#00b96b', '#f759ab', '#ffd166']

function colorOf(n) {
  let h = 0
  for (const ch of n) h = (h * 31 + ch.charCodeAt(0)) | 0
  return colors[Math.abs(h) % colors.length]
}
</script>

<template>
  <div>
    <PageBanner title="留言板" subtitle="留下你的足迹，友善交流" />

    <div class="bf-container">
      <main class="bf-main">
        <!-- 留言表单 -->
        <div class="bf-card form-card" v-reveal>
          <el-input v-model="name" placeholder="你的昵称（必填）" maxlength="20" class="name-input">
            <template #prefix><el-icon><User /></el-icon></template>
          </el-input>
          <el-input
            v-model="content"
            type="textarea"
            :rows="3"
            maxlength="300"
            show-word-limit
            placeholder="请输入留言内容..."
          />
          <div class="form-actions">
            <el-button type="primary" round @click="submit">
              <el-icon style="margin-right: 4px"><Position /></el-icon>提交留言
            </el-button>
          </div>
        </div>

        <!-- 留言列表 -->
        <div v-for="(m, i) in messages" :key="m.id" class="bf-card msg-card" v-reveal="(i % 6) * 60">
          <div class="msg-head">
            <div class="avatar" :style="{ background: colorOf(m.name) }">{{ m.name.slice(0, 1) }}</div>
            <div class="who">
              <div class="name">{{ m.name }}</div>
              <div class="date">{{ m.date }}</div>
            </div>
            <el-button text size="small" @click="replying = replying === m.id ? null : m.id">回复</el-button>
          </div>
          <p class="msg-content">{{ m.content }}</p>

          <div v-if="m.replies.length" class="replies">
            <div v-for="(r, i) in m.replies" :key="i" class="reply">
              <b>{{ r.name }}</b
              >：{{ r.content }}
              <span class="time">{{ r.date }}</span>
            </div>
          </div>

          <div v-if="replying === m.id" class="reply-input">
            <el-input v-model="replyText" size="small" placeholder="回复留言..." @keyup.enter="submitReply(m.id)" />
            <el-button size="small" type="primary" @click="submitReply(m.id)">发送</el-button>
          </div>
        </div>

        <el-empty v-if="!messages.length" description="还没有留言，快来抢占沙发" />
      </main>

      <AsideBox />
    </div>
  </div>
</template>

<style scoped>
.form-card,
.msg-card {
  padding: 18px 20px;
  margin-bottom: 16px;
}

.form-card .name-input {
  margin-bottom: 12px;
}

.form-card :deep(.el-textarea__inner) {
  background: var(--bf-input-bg);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.msg-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.msg-head .avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.msg-head .who {
  flex: 1;
}

.msg-head .name {
  font-weight: 600;
  color: var(--bf-text);
}

.msg-head .date {
  color: var(--bf-text-light);
  font-size: 12.5px;
}

.msg-content {
  margin: 12px 0 0;
  line-height: 1.8;
  color: var(--bf-text);
  word-break: break-word;
}

.replies {
  margin-top: 12px;
  padding: 10px 14px;
  background: var(--bf-tag-bg);
  border-radius: 8px;
}

.reply {
  font-size: 13.5px;
  color: var(--bf-text-sub);
  line-height: 2;
}

.reply b {
  color: var(--bf-primary);
}

.reply .time {
  font-size: 12px;
  color: var(--bf-text-light);
  margin-left: 8px;
}

.reply-input {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
</style>
