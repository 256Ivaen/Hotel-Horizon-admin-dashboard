import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

const isPortAvailable = (port) => {
  try {
    const command = process.platform === 'win32'
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port}`
    execSync(command, { stdio: 'ignore' })
    return false
  } catch (error) {
    return true
  }
}

const findAvailablePort = (startPort) => {
  let port = startPort
  while (!isPortAvailable(port)) {
    port++
  }
  return port
}

export default defineConfig({
  plugins: [react()],
  
  server: {
    port: findAvailablePort(3000),
    host: true,
    open: true,
    cors: true,
    fs: {
      allow: ['..'],
    }
  },
  
  preview: {
    port: findAvailablePort(4173),
    host: true,
    open: true
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'axios']
        }
      }
    }
  },
  
  base: './',
  
  assetsInclude: ['**/*.MP4', '**/*.mp4', '**/*.MOV', '**/*.mov', '**/*.AVI', '**/*.avi'],
  
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@utils': '/src/utils',
      '@assets': '/src/assets',
      '@hooks': '/src/hooks',
      '@contexts': '/src/contexts',
      '@layouts': '/src/layouts',
      '@services': '/src/services',
      '@styles': '/src/styles',
      '@types': '/src/types'
    }
  },
  
  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },

  optimizeDeps: {
    include: ['react', 'react-dom'],
  }
})