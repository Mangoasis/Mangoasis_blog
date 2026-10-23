import { reactive } from 'vue'

/**
 * 本地登录态（静态站点演示用）
 * 账号：mangoasis  密码：mangoasis1210
 * 勾选"免登录"时持久化到 localStorage（7 天有效），否则仅当前会话（sessionStorage）
 */

const AUTH_KEY = 'mangoasis-auth'
const EXPIRE_DAYS = 7

const CREDENTIALS = Object.freeze({
  account: 'mangoasis',
  password: 'mangoasis1210'
})

function loadUser() {
  for (const store of [localStorage, sessionStorage]) {
    try {
      const raw = store.getItem(AUTH_KEY)
      if (!raw) continue
      const data = JSON.parse(raw)
      if (data && data.account && Date.now() - data.at < EXPIRE_DAYS * 86400000) {
        return data
      }
      store.removeItem(AUTH_KEY)
    } catch (e) {
      /* ignore */
    }
  }
  return null
}

export const auth = reactive({
  user: loadUser()
})

export function isLoggedIn() {
  return !!auth.user
}

/** 校验账号密码，成功返回 true 并写入登录态 */
export function login(account, password, remember = true) {
  const ok =
    String(account).trim().toLowerCase() === CREDENTIALS.account &&
    String(password) === CREDENTIALS.password
  if (!ok) return false

  const user = { account: CREDENTIALS.account, at: Date.now() }
  auth.user = user
  try {
    const store = remember ? localStorage : sessionStorage
    store.setItem(AUTH_KEY, JSON.stringify(user))
    ;(remember ? sessionStorage : localStorage).removeItem(AUTH_KEY)
  } catch (e) {
    /* ignore */
  }
  return true
}

export function logout() {
  auth.user = null
  try {
    localStorage.removeItem(AUTH_KEY)
    sessionStorage.removeItem(AUTH_KEY)
  } catch (e) {
    /* ignore */
  }
}

export const AUTH_ACCOUNT = CREDENTIALS.account
