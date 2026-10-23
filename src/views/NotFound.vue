<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="notfound">
    <div class="code">404</div>
    <div class="text">抱歉，你访问的页面不存在或已被移除</div>
    <div class="sub">Page Not Found</div>
    <el-button type="primary" round size="large" @click="router.push('/home')">
      <el-icon style="margin-right: 6px"><HomeFilled /></el-icon>
      回到首页
    </el-button>
  </div>
</template>

<style scoped>
.notfound {
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  text-align: center;
}

.code {
  font-size: 110px;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(120deg, var(--bf-primary), var(--bf-hover));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.text {
  font-size: 18px;
  color: var(--bf-text);
  margin-top: 10px;
}

.sub {
  color: var(--bf-text-light);
  font-size: 14px;
  margin-bottom: 22px;
}
</style>
