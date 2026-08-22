import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: 'https://queueless-8p13.onrender.com',
        changeOrigin: true,
      },
    },
  },
})