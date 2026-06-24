import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/dormitory-management/',
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
