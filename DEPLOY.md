# Mangoasis 发布指南

站点为纯静态构建（`npm run build` → `dist/`，哈希路由 + 相对路径），可托管到任何静态服务。推荐 **Vercel / Cloudflare Pages**（推送即自动部署，最适合持续修改），或 **GitHub Pages**（已配好工作流）。

---

## 方式 A：Vercel / Cloudflare Pages（推荐，全自动）

1. 在 GitHub 创建仓库（如 `mangoasis`），把本项目推送上去：
   ```bash
   git remote add origin https://github.com/<你的用户名>/mangoasis.git
   git push -u origin main
   ```
2. 打开 [vercel.com/new](https://vercel.com/new)（或 pages.cloudflare.com）→ 用 GitHub 登录 → 导入该仓库
3. 构建设置会自动识别为 Vite：构建命令 `npm run build`，输出目录 `dist`，直接点部署
4. 完成后获得 `https://mangoasis.vercel.app`（可绑定自己的域名）

**之后每次修改**：本地改完 → `git add . && git commit -m "..." && git push` → 自动构建上线（约 1 分钟）。

## 方式 B：GitHub Pages（工作流已配置）

1. 推送仓库到 GitHub（同上）
2. 仓库 **Settings → Pages → Build and deployment → Source 选 `GitHub Actions`**
3. 推送到 `main` 分支即自动构建部署，地址为 `https://<用户名>.github.io/mangoasis/`
4. 首次需手动触发或推送一次（Actions 页可查看进度）

## 方式 C：自己的服务器（Nginx）

```bash
npm run build
# 将 dist/ 目录内容上传到服务器，例如 /var/www/mangoasis
```

Nginx 参考配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/mangoasis;
    index index.html;
    gzip on;
    gzip_types text/css application/javascript image/svg+xml application/json;
    location / {
        try_files $uri $uri/ /index.html;
    }
    location ~* \.(js|css|svg|png|jpg)$ {
        expires 30d;
    }
}
```

## 方式 D：Gitee Pages（国内访问快）

推送到 Gitee 仓库 → 仓库页开启 Gitee Pages（需实名认证）→ 每次更新后手动点「更新」（免费版不自动）。

---

## 📝 持续更新内容的正确姿势（重要）

站点是**纯静态**的：文章数据保存在每个访客自己的浏览器里。因此：

**站长写作 / 修改内容后，要让所有访客看到，按以下流程：**

1. 本地 `npm run dev` 打开站点，在写作页 / 随笔 / 相册中完成内容（或直接在线上站点写完后在个人中心「导出全部数据」）
2. 「个人中心 → **导出全部数据**」得到 `mangoasis-backup-*.json`
3. 用备份 JSON 中的 `data` 部分更新 **`public/data/content.json`**（新访客与清缓存访客将自动加载它）
   - 快捷方式：`node scripts/gen-content.mjs` 可从种子数据重新生成
4. `git commit + push` → 自动部署 → 所有访客看到新内容

> 站长自己的浏览器会保留已加载的旧数据（避免被覆盖），想看最新仓库内容时在浏览器控制台执行 `localStorage.clear()` 后刷新即可。

**纯代码 / 样式修改**：直接改代码 → commit → push，全自动上线。

---

## 登录凭据

- 账号 `mangoasis` / 密码 `mangoasis1210`（在 `src/stores/auth.js` 中修改）
- 该凭据仅用于本地演示，前端凭据本就公开；接入真实后端（建议清单 #16）后请改用服务端鉴权
