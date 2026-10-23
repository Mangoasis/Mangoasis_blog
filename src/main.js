import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

/* 网页字体（按 unicode-range 子集加载，浏览器按需下载） */
import '@fontsource/noto-sans-sc/400.css'
import '@fontsource/noto-sans-sc/500.css'
import '@fontsource/noto-sans-sc/700.css'
import '@fontsource/lxgw-wenkai/500.css'
import '@fontsource/lxgw-wenkai/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'

import App from './App.vue'
import router from './router'
import { siteStore } from './stores/site'
import { installReveal } from './directives/reveal'
import { installKeyboardNav } from './composables/useKeyboardNav'
import { installCodeCopy } from './composables/useCodeCopy'
import './styles/butterfly.css'
import './styles/markdown.css'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus, { locale: zhCn })
app.use(router)
installReveal(app)
installKeyboardNav()
installCodeCopy()
app.mount('#app')

// 恢复主题模式（暗黑 / 明亮）
siteStore.initTheme()
