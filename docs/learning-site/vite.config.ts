import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 项目站点部署在 https://<user>.github.io/<repo>/
// 本地开发则用根路径。通过环境变量 CI 区分。
const base = process.env.CI ? '/Vibe-Trading/' : '/';

export default defineConfig({
  plugins: [react()],
  base,
});
