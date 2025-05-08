import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // string shorthand for simple proxying
      // '/api': 'http://localhost:3000',
      // with options
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // secure: false, // uncomment if your backend is http and you get certificate errors
        // rewrite: (path) => path.replace(/^\/api/, '') // if you want to remove /api prefix when proxying
      },
    },
  },
})
