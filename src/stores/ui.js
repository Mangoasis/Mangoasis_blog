import { reactive } from 'vue'

/** 界面级全局状态（快捷搜索开关等） */
export const ui = reactive({
  searchOpen: false
})

export function openSearch() {
  ui.searchOpen = true
}

export function closeSearch() {
  ui.searchOpen = false
}
