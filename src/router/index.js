import { createRouter, createWebHashHistory } from 'vue-router'
import { isLoggedIn } from '../stores/auth'

const routes = [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/articleList',
    name: 'ArticleList',
    component: () => import('../views/ArticleList.vue'),
    meta: { title: '文章' }
  },
  {
    path: '/article/:id',
    name: 'Article',
    component: () => import('../views/ArticleDetail.vue'),
    meta: { title: '文章详情' }
  },
  {
    path: '/archives',
    name: 'Archives',
    component: () => import('../views/Archives.vue'),
    meta: { title: '时间线' }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/Categories.vue'),
    meta: { title: '分类' }
  },
  {
    path: '/categories/:name',
    name: 'CategoryPosts',
    component: () => import('../views/CategoryPosts.vue'),
    meta: { title: '分类文章' }
  },
  {
    path: '/tags',
    name: 'Tags',
    component: () => import('../views/Tags.vue'),
    meta: { title: '标签' }
  },
  {
    path: '/tags/:name',
    name: 'TagPosts',
    component: () => import('../views/TagPosts.vue'),
    meta: { title: '标签文章' }
  },
  {
    path: '/write',
    name: 'Write',
    component: () => import('../views/Write.vue'),
    meta: { title: '编写文章', requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/talk',
    name: 'Talk',
    component: () => import('../views/Talk.vue'),
    meta: { title: '随笔' }
  },
  {
    path: '/photoAlbum',
    name: 'PhotoAlbum',
    component: () => import('../views/PhotoAlbum.vue'),
    meta: { title: '相册' }
  },
  {
    path: '/resources',
    name: 'Resources',
    component: () => import('../views/Resources.vue'),
    meta: { title: '资源' }
  },
  // 兼容 mrzym.top 风格的资源分类链接
  { path: '/resources/front', redirect: { path: '/resources', query: { cat: '前端' } } },
  { path: '/resources/back', redirect: { path: '/resources', query: { cat: '后端' } } },
  {
    path: '/message',
    name: 'Message',
    component: () => import('../views/Message.vue'),
    meta: { title: '留言板' }
  },
  {
    path: '/link',
    name: 'Link',
    component: () => import('../views/Link.vue'),
    meta: { title: '友链' }
  },
  {
    path: '/userCenter',
    name: 'UserCenter',
    component: () => import('../views/UserCenter.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: { title: '关于' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '页面未找到' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

/* 登录守卫：写作 / 个人中心需登录，未登录跳转登录页并记录回跳地址 */
router.beforeEach((to) => {
  if (to.path === '/login' && isLoggedIn()) return { path: '/home' }
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})

router.afterEach((to) => {
  const base = document.title.split(' | ').pop()
  document.title = to.meta.title ? `${to.meta.title} | ${base}` : base
})

export default router
