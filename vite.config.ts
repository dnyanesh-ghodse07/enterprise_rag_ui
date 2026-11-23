import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type UserConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview, mode }) => {
  const config: UserConfig = {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
    },
  }

  if (command !== 'serve' || isPreview) return config

  const { VITE_API_URL = 'http://localhost:8000/api/v1' } = loadEnv(mode, import.meta.dirname)
  if (!/^https?:\/\//i.test(VITE_API_URL)) return config

  const apiUrl = new URL(VITE_API_URL)
  const apiPath = apiUrl.pathname.replace(/\/+$/, '')
  if (!apiPath) return config

  return {
    ...config,
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiPath),
    },
    server: {
      proxy: {
        [`${apiPath}/`]: {
          target: apiUrl.origin,
          changeOrigin: true,
        },
      },
    }
  }
})
