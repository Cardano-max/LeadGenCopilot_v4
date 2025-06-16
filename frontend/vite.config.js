import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true, // Enable network access
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['framer-motion'],
          ui: ['lucide-react', 'react-hot-toast'],
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          router: ['react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'lucide-react',
      '@stripe/stripe-js',
      '@stripe/react-stripe-js',
      'react-hot-toast',
      'react-intersection-observer',
      'react-router-dom',
      'axios'
    ]
  },
  define: {
    'process.env': process.env
  },
  preview: {
    port: 4173,
    host: true
  }
})