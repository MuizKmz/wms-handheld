import {defineConfig, loadEnv} from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import postcssPxToViewport from 'postcss-px-to-viewport';

// import requireTransform from 'vite-plugin-require-transform'

// https://vitejs.dev/config/
export default defineConfig(async ({command, mode}) => {
    // 根据当前工作目录中的 `mode` 加载 .env 文件
    // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
    const env = loadEnv(mode, process.cwd(), '')
    const UnoCSS = await import('unocss/vite').then(i => i.default)
    return {
        server: {
            host: '0.0.0.0',
            port: 5173,
            proxy: {
                '/api': {
                    target: env.VITE_API_BASE_URL || 'http://172.19.1.22:3000',
                    changeOrigin: true,
                    secure: false
                },
                '/auth': {
                    target: env.VITE_API_BASE_URL || 'http://172.19.1.22:3000',
                    changeOrigin: true,
                    secure: false
                },
                '/epc': {
                    target: env.VITE_API_BASE_URL || 'http://172.19.1.22:3000',
                    changeOrigin: true,
                    secure: false
                }
            }
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler',
                    additionalData: `@import "@/static/styles/theme.scss";`,
                    quietDeps: ['node_modules/uview-plus/'],
                    quiet: true,
                }
            },
            postcss: {
                plugins: [
                    postcssPxToViewport({
                        unitToConvert: 'px',
                        viewportWidth: 360,  // 设计稿宽度
                        viewportHeight: 640, // 设计稿高度，可选项
                        unitPrecision: 5,    // px 转换为 vw 后保留的小数位数
                        propList: ['*'],
                        viewportUnit: 'vw',  // 希望使用的视口单位
                        fontViewportUnit: 'vw',
                        selectorBlackList: [],  // 指定不需要转换的类
                        minPixelValue: 1,    // 小于或等于 1px 不转换为视口单位
                        mediaQuery: false,   // 允许在媒体查询中转换 px
                        replace: true,
                        exclude: [/node_modules\/(?!(@jobbok\/uview-plus))/],  // 排除node_modules中的文件,除uview-plus外
                        landscape: false,
                        landscapeUnit: 'vw',
                        landscapeWidth: 640
                    })
                ]
            }
        },
        plugins: [
            uni(),
            UnoCSS(),
        ],
        define: {
            'process.env': env
        }
    }
})
