import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/pokedex-mini-joy/', // replace with your own repo name
  plugins: [react()],
})
