import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
  allowedHosts: ['frontend.majmohar.eu', 'localhost'],
  proxy: {
    '/api': {
      target: 'https://backend.majmohar.eu',
      changeOrigin: true,
      secure: true,
    },
  },
},

})
