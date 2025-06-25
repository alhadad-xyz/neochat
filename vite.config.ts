/**
 * @fileoverview Vite Configuration for CanistChat Frontend
 * 
 * This configuration optimizes the build process for production deployment
 * with code splitting, performance optimizations, and bundle analysis.
 * 
 * Features:
 * - Code splitting for better performance
 * - Bundle analysis and optimization
 * - TypeScript compilation
 * - Asset optimization
 * - Development server configuration
 * 
 * @author CanistChat Development Team
 * @version 2.0.0
 * @since 1.0.0
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

export default defineConfig({
  // ============================================================================
  // PLUGINS
  // ============================================================================
  
  plugins: [
    react({
      // JSX runtime for better performance
      jsxRuntime: 'automatic',
    }),
  ],

  // ============================================================================
  // RESOLVE CONFIGURATION
  // ============================================================================
  
  resolve: {
    alias: {
      // Path aliases for cleaner imports
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@services': resolve(__dirname, 'src/services'),
      '@types': resolve(__dirname, 'src/types'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@styles': resolve(__dirname, 'src/styles'),
    },
  },

  // ============================================================================
  // BUILD CONFIGURATION
  // ============================================================================
  
  build: {
    // Output directory
    outDir: 'dist',
    
    // Source maps for debugging
    sourcemap: false, // Disabled for production
    
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: true,
        drop_debugger: true,
        // Optimize for size
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    
    // Rollup configuration for code splitting
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-ui': ['@heroicons/react', '@headlessui/react'],
          'vendor-utils': ['date-fns', 'lodash'],
          'vendor-dfinity': ['@dfinity/agent', '@dfinity/auth-client'],
          
          // Feature chunks
          'feature-chat': [
            './src/components/ChatInterface.tsx',
            './src/components/chat/',
          ],
          'feature-dashboard': [
            './src/components/dashboard/',
          ],
          'feature-agents': [
            './src/components/agents/',
          ],
          'feature-analytics': [
            './src/components/analytics/',
          ],
        },
        
        // Chunk file naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name || '')) {
            return `assets/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name || '')) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name || '')) {
            return `assets/fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Target for better browser compatibility
    target: 'es2015',
  },

  // ============================================================================
  // SERVER CONFIGURATION
  // ============================================================================
  
  server: {
    // Development server port
    port: 3000,
    
    // CORS configuration
    cors: true,
    
    // Proxy configuration for API calls
    proxy: {
      '/api': {
        target: 'http://localhost:4943',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // ============================================================================
  // PREVIEW CONFIGURATION
  // ============================================================================
  
  preview: {
    // Preview server port
    port: 4173,
  },

  // ============================================================================
  // OPTIMIZE DEPENDENCIES
  // ============================================================================
  
  optimizeDeps: {
    // Include dependencies for pre-bundling
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@heroicons/react',
      '@headlessui/react',
      '@dfinity/agent',
      '@dfinity/auth-client',
      'date-fns',
      'lodash',
    ],
    
    // Exclude dependencies from pre-bundling
    exclude: [
      // Exclude large dependencies that should be loaded dynamically
    ],
  },

  // ============================================================================
  // CSS CONFIGURATION
  // ============================================================================
  
  css: {
    // PostCSS configuration
    postcss: {
      plugins: [
        // Add PostCSS plugins if needed
      ],
    },
    
    // CSS modules configuration
    modules: {
      // Enable CSS modules for .module.css files
      localsConvention: 'camelCase',
    },
  },

  // ============================================================================
  // ENVIRONMENT VARIABLES
  // ============================================================================
  
  define: {
    // Global constants
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  // ============================================================================
  // EXPERIMENTAL FEATURES
  // ============================================================================
  
  experimental: {
    // Enable experimental features
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` };
      } else {
        return { relative: true };
      }
    },
  },
}); 