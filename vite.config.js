import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Removed proxy since we're using the deployed API directly
    // The API calls will go to https://keyez-dev.descube.in/api
  }
})