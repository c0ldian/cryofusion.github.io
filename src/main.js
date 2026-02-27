import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

// KaTeX CSS（自动渲染会使用）
import 'katex/dist/katex.min.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 挂载后自动渲染页面中的 LaTeX 公式
app.mount('#app')

// 导入 KaTeX 自动渲染并执行
import 'katex/dist/contrib/auto-render.min.js'

// 等待下个 tick 确保 DOM 已更新
setTimeout(() => {
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
      ],
      throwOnError: false
    })
    console.log('KaTeX auto-render initialized')
  } else {
    console.warn('renderMathInElement not available')
  }
}, 0)