import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    // Only enable the API proxy in development.
    // In production the frontend calls VITE_API_URL directly.
    ...(mode === 'development' && {
      server: {
        proxy: {
          '/api': {
            target: env.VITE_API_URL || 'http://localhost:5000',
            changeOrigin: true,
          },
        },
      },
    }),

    build: {
      outDir: 'dist',
      sourcemap: true,          // readable stack traces in Sentry / production
      rollupOptions: {
        output: {
          // Split vendor chunks for better long-term caching
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
            query: ['@tanstack/react-query'],
          },
        },
      },
    },
  }
})
