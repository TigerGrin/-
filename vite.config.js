import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  server: {
    host: '0.0.0.0', // 允许外部访问（绑定所有网络接口）
    port: 5173,
    strictPort: false, // 如果端口被占用，尝试下一个可用端口
    cors: true, // 启用CORS
    // HMR配置：外部访问时自动使用访问的IP地址
    hmr: {
      protocol: 'ws' // WebSocket协议
    },
    proxy: {
      '/api': {
        target: 'https://eflfbpmxcpqg.sealoshzh.site',
        changeOrigin: true,
        secure: false, // 如果目标服务器证书有问题，设置为false
        timeout: 30000,
        rewrite: (path) => path,
        ws: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ 代理错误:', err.message)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📤 代理请求:', req.method, req.url, '->', proxyReq.path)
          })
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📥 代理响应:', proxyRes.statusCode, req.url)
          })
        }
      }
    }
  }
})
