import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: You must change 'your-repo-name' to the name of your GitHub repository
  base: '/your-repo-name/', 
})
