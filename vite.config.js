import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // iCloud Drive periodically replaces `node_modules` with a
      // `node_modules.nosync` symlink and recreates thousands of
      // tsconfig.json files inside it. Without these ignores Vite's
      // file watcher thrashes on every replacement, blows past its RSS
      // budget, and the dev server gets killed (exit 137). Excluding
      // both paths from the watcher fixes the crash loop while leaving
      // normal source-file watching intact.
      ignored: [
        '**/node_modules/**',
        '**/node_modules.nosync/**',
        '**/.git/**',
      ],
    },
  },
})
