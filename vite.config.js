import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this app from a /KOLski-investmentapp/ subpath, not the domain
// root, so built asset URLs need that prefix there. Vercel serves from the root, so
// the default base ('/') is correct everywhere else. deploy-pages.yml sets
// GITHUB_PAGES=true only for the Pages build.
// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/KOLski-investmentapp/' : '/',
  plugins: [react()],
})
