<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { siteStore } from '../stores/site'
import { login } from '../stores/auth'

const route = useRoute()
const router = useRouter()

const account = ref('')
const password = ref('')
const remember = ref(true)
const loading = ref(false)
const shake = ref(false)

const redirect = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') ? r : '/home'
})

async function submit() {
  if (!account.value.trim() || !password.value) {
    ElMessage.warning('请输入账号和密码')
    return
  }
  loading.value = true
  // 模拟网络延迟，过渡更自然
  await new Promise((r) => setTimeout(r, 450))
  const ok = login(account.value, password.value, remember.value)
  loading.value = false
  if (!ok) {
    shake.value = true
    setTimeout(() => (shake.value = false), 500)
    ElMessage.error('账号或密码错误，请重试')
    return
  }
  ElMessage.success('欢迎回来，Mangoasis 站长！')
  router.push(redirect.value)
}
</script>

<template>
  <div class="login-page">
    <div class="login-card glass" :class="{ shake }" v-reveal>
      <img class="login-logo" :src="siteStore.logo" alt="logo" />
      <h1 class="login-title">{{ siteStore.title }}</h1>
      <p class="login-sub">登录后可写作发布、上传照片、管理个人空间</p>

      <el-input v-model="account" placeholder="账号" size="large" maxlength="30" @keyup.enter="submit">
        <template #prefix><el-icon><User /></el-icon></template>
      </el-input>
      <el-input
        v-model="password"
        type="password"
        placeholder="密码"
        size="large"
        show-password
        @keyup.enter="submit"
      >
        <template #prefix><el-icon><Lock /></el-icon></template>
      </el-input>

      <div class="login-row">
        <el-checkbox v-model="remember">7 天内免登录</el-checkbox>
      </div>

      <el-button type="primary" size="large" round class="login-submit" :loading="loading" @click="submit">
        登 录
      </el-button>
      <el-button text class="login-skip" @click="router.push(redirect)">
        先逛逛，暂不登录
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: calc(100vh - 60px);
  padding: 60px 16px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: min(400px, 94%);
  padding: 36px 34px 26px;
  border-radius: var(--bf-radius-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.login-logo {
  width: 66px;
  height: 66px;
  margin: 0 auto;
  filter: drop-shadow(0 6px 16px rgba(255, 145, 60, 0.45));
  animation: logoFloat 3.2s ease-in-out infinite;
}

@keyframes logoFloat {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

.login-title {
  font-family: var(--bf-font-serif);
  font-size: 26px;
  margin: 2px 0 0;
  letter-spacing: 2px;
  color: var(--bf-text);
}

.login-sub {
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--bf-text-sub);
}

.login-row {
  display: flex;
  justify-content: flex-start;
}

.login-submit {
  width: 100%;
  background: linear-gradient(135deg, var(--bf-primary), #6fc3f7) !important;
  border: none !important;
  font-size: 15px;
  letter-spacing: 4px;
}

.login-skip {
  color: var(--bf-text-light);
}

/* 密码错误抖动 */
.shake {
  animation: shakeX 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

@keyframes shakeX {
  10%,
  90% {
    transform: translateX(-2px);
  }

  20%,
  80% {
    transform: translateX(4px);
  }

  30%,
  50%,
  70% {
    transform: translateX(-7px);
  }

  40%,
  60% {
    transform: translateX(7px);
  }
}
</style>
