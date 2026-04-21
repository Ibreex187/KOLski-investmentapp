import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Use relative asset paths for static hosting (e.g., GitHub Pages).
  base: command === 'build' ? './' : '/',
}))
