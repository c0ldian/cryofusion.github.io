import { h } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'

export function useKatex() {
  const renderMath = (expr, displayMode = false) => {
    try {
      return katex.renderToString(expr, {
        displayMode,
        throwOnError: false,
        output: 'html',
      })
    } catch (e) {
      console.warn('KaTeX render error:', expr, e)
      return expr
    }
  }

  return { renderMath }
}