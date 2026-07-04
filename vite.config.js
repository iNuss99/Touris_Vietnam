import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    watch: {
      ignored: ['**/Video_background/**']
    }
  },
  // cau hinh build du an cho production
  build: {
    target: 'es2020',
    minify: 'terser', // su dung terser lam trinh minify code JS
    terserOptions: {
      compress: {
        drop_console: true, // xoa sach console.log trong production de bao mat va gon nhe
        drop_debugger: true // xoa sach debugger trong ban build san pham
      }
    },
    rollupOptions: {
      output: {
        // Code splitting function cho Vite 8 / Rolldown
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (/\.(png|jpe?g|svg|gif|webp|avif|ico)$/i.test(name)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.css$/i.test(name)) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    sourcemap: false,
  },
})
