<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { siteStore } from '../stores/site'
import { auth, isLoggedIn, logout } from '../stores/auth'
import { openSearch } from '../stores/ui'

const route = useRoute()
const router = useRouter()
const scrolled = ref(false)
const drawerOpen = ref(false)

/** 常用菜单（导航栏直出） */
const primaryMenus = [
  { path: '/home', title: '首页', icon: 'HomeFilled', color: '#49b1f5' },
  { path: '/articleList', title: '文章', icon: 'Tickets', color: '#ff9f43' },
  { path: '/archives', title: '时间线', icon: 'Timer', color: '#a78bfa' },
  { path: '/photoAlbum', title: '相册', icon: 'Picture', color: '#fbbf24' },
  { path: '/talk', title: '随笔', icon: 'Notebook', color: '#22d3ee' },
  { path: '/categories', title: '分类', icon: 'Collection', color: '#34d399' },
  { path: '/message', title: '留言板', icon: 'Comment', color: '#f87171' },
  { path: '/resources', title: '资源', icon: 'Files', color: '#94a3b8' },
  { path: '/about', title: '关于', icon: 'User', color: '#818cf8' }
]

/** 折叠进「更多」的低频菜单 */
const moreMenus = [
  { path: '/tags', title: '标签', icon: 'CollectionTag', color: '#f472b6' },
  { path: '/link', title: '友链', icon: 'Link', color: '#2dd4bf' }
]

/** 全部菜单（移动端抽屉平铺展示） */
const drawerMenus = [...primaryMenus, ...moreMenus, { path: '/userCenter', title: '个人中心', icon: 'Setting', color: '#f59e0b', auth: true }]

const moreActive = computed(() => moreMenus.some((m) => m.path === route.path))
const visibleDrawerMenus = drawerMenus.filter((m) => !m.auth || isLoggedIn())

function onScroll() {
  scrolled.value = window.scrollY > 10
}

function go(path) {
  drawerOpen.value = false
  router.push(path)
}

function onSearch() {
  drawerOpen.value = false
  openSearch()
}

function goLogin() {
  drawerOpen.value = false
  router.push({ path: '/login', query: { redirect: route.fullPath } })
}

function onUserCommand(cmd) {
  if (cmd === 'center') go('/userCenter')
  else if (cmd === 'write') go('/write')
  else if (cmd === 'logout') {
    logout()
    ElMessage.success('已退出登录')
    go('/home')
  }
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="bf-nav" :class="{ scrolled }">
    <div class="bf-nav-inner">
      <!-- 左：站点 logo -->
      <div class="bf-logo" @click="go('/home')">
        <img :src="siteStore.logo" alt="Mangoasis logo" />
        <span>{{ siteStore.title }}</span>
      </div>

      <!-- 中：主菜单 -->
      <nav class="bf-menu desktop menu-center">
        <div
          v-for="m in primaryMenus"
          :key="m.path"
          class="bf-menu-item"
          :class="{ active: route.path === m.path }"
          :style="{ '--icon-c': m.color }"
          @click="go(m.path)"
        >
          <el-icon><component :is="m.icon" /></el-icon>
          {{ m.title }}
        </div>

        <!-- 更多（低频菜单折叠） -->
        <el-dropdown trigger="hover" :show-timeout="120" :hide-timeout="200" popper-class="nav-more-popper">
          <div class="bf-menu-item nav-more" :class="{ active: moreActive }" :style="{ '--icon-c': '#64748b' }">
            <el-icon><MoreFilled /></el-icon>
            更多
            <el-icon class="chevron" :size="12"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="m in moreMenus"
                :key="m.path"
                :class="{ picked: route.path === m.path }"
                @click="go(m.path)"
              >
                <el-icon :style="{ color: m.color }"><component :is="m.icon" /></el-icon>
                {{ m.title }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </nav>

      <!-- 右：操作区 -->
      <div class="nav-actions desktop">
        <el-tooltip content="快捷搜索（Ctrl + K）" placement="bottom" :show-after="300">
          <button class="nav-icon-btn" aria-label="搜索" @click="onSearch">
            <el-icon :size="17"><Search /></el-icon>
          </button>
        </el-tooltip>

        <!-- 登录态：头像下拉；未登录：头像点击去登录 -->
        <el-dropdown v-if="auth.user" trigger="click" @command="onUserCommand">
          <button class="nav-avatar" :title="auth.user.account" aria-label="账号">
            <img :src="siteStore.author.avatar" alt="avatar" />
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item disabled>
                <el-icon><User /></el-icon>{{ auth.user.account }}
              </el-dropdown-item>
              <el-dropdown-item command="center">
                <el-icon><Setting /></el-icon>个人中心
              </el-dropdown-item>
              <el-dropdown-item command="write">
                <el-icon><EditPen /></el-icon>写作
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <button v-else class="nav-avatar" title="点击登录" aria-label="登录" @click="goLogin">
          <img :src="siteStore.author.avatar" alt="avatar" />
          <span class="avatar-badge"><el-icon :size="10"><Plus /></el-icon></span>
        </button>

        <el-button class="bf-write-btn" size="small" @click="go('/write')">
          <el-icon style="margin-right: 4px"><EditPen /></el-icon>
          写作
        </el-button>
      </div>

      <!-- 移动端汉堡按钮 -->
      <button class="bf-mobile-toggle" aria-label="菜单" @click="drawerOpen = true">
        <el-icon :size="22"><Expand /></el-icon>
      </button>
    </div>
  </header>

  <!-- 移动端抽屉菜单 -->
  <el-drawer v-model="drawerOpen" direction="rtl" size="72%" :show-close="false" :with-header="false">
    <div class="mobile-menu">
      <div class="mobile-head">
        <img :src="siteStore.author.avatar" alt="avatar" />
        <div class="mobile-head-text">
          <span>{{ siteStore.title }}</span>
          <small>{{ auth.user ? auth.user.account : '未登录' }}</small>
        </div>
      </div>
      <div class="mobile-item" @click="onSearch">
        <el-icon style="color: #49b1f5"><Search /></el-icon>
        <span>搜索</span>
        <kbd class="mobile-kbd">Ctrl K</kbd>
      </div>
      <div
        v-for="m in visibleDrawerMenus"
        :key="m.path"
        class="mobile-item"
        :class="{ active: route.path === m.path }"
        :style="{ '--icon-c': m.color }"
        @click="go(m.path)"
      >
        <el-icon><component :is="m.icon" /></el-icon>
        <span>{{ m.title }}</span>
        <el-icon class="arrow"><ArrowRight /></el-icon>
      </div>

      <div v-if="!auth.user" class="mobile-item login" @click="goLogin">
        <el-icon style="color: #34d399"><User /></el-icon>
        <span>登录</span>
        <el-icon class="arrow"><ArrowRight /></el-icon>
      </div>
      <div v-else class="mobile-item logout" @click="onUserCommand('logout')">
        <el-icon><SwitchButton /></el-icon>
        <span>退出登录</span>
      </div>

      <el-button class="bf-write-btn" style="width: 100%; height: 42px; font-size: 15px" @click="go('/write')">
        <el-icon style="margin-right: 6px"><EditPen /></el-icon>
        写一篇新文章
      </el-button>
    </div>
  </el-drawer>
</template>

<style scoped>
/* 三段式：logo 左 / 菜单中 / 操作右 */
.menu-center {
  flex: 1;
  justify-content: center;
  margin: 0 20px;
  min-width: 0;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.nav-icon-btn {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--bf-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s;
  margin: 0 2px;
}

.nav-icon-btn:hover {
  color: var(--bf-primary);
  background: rgba(73, 177, 245, 0.12);
}

/* 个人头像（登录前后都显示） */
.nav-avatar {
  position: relative;
  width: 34px;
  height: 34px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  margin: 0 4px;
  outline-offset: 2px;
}

.nav-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  object-position: center 22%;
  box-shadow: 0 0 0 2px rgba(255, 159, 67, 0.65);
  transition: transform 0.3s;
}

.nav-avatar:hover img {
  transform: scale(1.1);
}

/* 未登录时头像右上角的小 + 徽标 */
.avatar-badge {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--bf-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}

/* 更多折叠项 */
.nav-more {
  user-select: none;
}

.nav-more .chevron {
  margin-left: -2px;
  transition: transform 0.25s;
}

.nav-more:hover .chevron {
  transform: rotate(180deg);
}

/* 登录后头像按钮 */
.nav-avatar {
  outline-offset: 2px;
}

.mobile-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 10px;
  font-size: 15.5px;
  color: var(--bf-text);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.mobile-item:hover,
.mobile-item.active {
  color: var(--bf-primary);
  background: rgba(73, 177, 245, 0.08);
}

.mobile-item .el-icon {
  color: var(--icon-c, var(--bf-text-sub));
  transition: transform 0.25s;
}

.mobile-item:hover .el-icon,
.mobile-item.active .el-icon {
  transform: scale(1.2) rotate(-6deg);
}

.mobile-item.login {
  color: #34d399;
  font-weight: 600;
}

.mobile-item.logout {
  color: var(--el-color-danger);
}

.mobile-item .arrow {
  margin-left: auto;
  color: var(--bf-text-light);
}

.mobile-kbd {
  margin-left: auto;
  font-family: var(--bf-font-mono);
  font-size: 11px;
  color: var(--bf-text-light);
  border: 1px solid var(--bf-card-border);
  border-radius: 4px;
  padding: 2px 6px;
}

/* 移动端抽屉 */
.mobile-menu {
  padding: 8px 4px;
}

.mobile-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 8px 14px;
  border-bottom: 1px solid var(--bf-card-border);
  margin-bottom: 10px;
}

.mobile-head img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center 22%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}

.mobile-head-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mobile-head-text span {
  font-family: var(--bf-font-serif);
  font-size: 17.5px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--bf-text);
}

.mobile-head-text small {
  font-size: 12px;
  color: var(--bf-text-light);
}
</style>
