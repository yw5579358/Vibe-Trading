import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 项目站点部署在 https://<user>.github.io/<repo>/
// CI 环境自动用 /<repo>/ 作为 base，本地开发用根路径。
// 仓库名从 GITHUB_REPOSITORY 环境变量提取（格式：owner/repo），保证改仓库名也生效。
function getBase() {
  if (!process.env.CI) return '/';
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'Vibe-Trading';
  return `/${repo}/`;
}

export default defineConfig({
  plugins: [react()],
  base: getBase(),
});
