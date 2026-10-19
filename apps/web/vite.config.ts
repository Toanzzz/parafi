import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  server: {
    port: 58001,
    strictPort: true,
    proxy: { '/api': 'http://localhost:58002' },
  },
})
