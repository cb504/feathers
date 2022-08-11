import { prettier, getJavaScript, PRETTIERRC } from '@feathersjs/cli'
import { getHighlighter } from 'shiki'
import { ThemeOptions } from 'vitepress'

export async function highlight(theme: ThemeOptions = 'material-palenight') {
  const themes = typeof theme === 'string' ? [theme] : [theme.dark, theme.light]
  const highlighter = await getHighlighter({ themes })
  const preRE = /^<pre.*?>/
  const highlightCode = (str: string, lang: string, theme: ThemeOptions) => {
    if (typeof theme === 'string') {
      return highlighter
        .codeToHtml(str, { lang, theme })
        .replace(preRE, '<pre v-pre>')
    }

    const dark = highlighter
      .codeToHtml(str, { lang, theme: theme.dark })
      .replace(preRE, '<pre v-pre class="vp-code-dark">')

    const light = highlighter
      .codeToHtml(str, { lang, theme: theme.light })
      .replace(preRE, '<pre v-pre class="vp-code-light">')

    return dark + light
  }

  return (code: string, lang: string) => {
    lang = lang || 'text'

    if (lang === 'ts' || lang === 'typescript') {
      const prettierOptions = {
        ...PRETTIERRC,
        printWidth: 80
      }
    
      const javascript = getJavaScript(code)
      const formattedJS = prettier.format(javascript, {
        ...prettierOptions,
        parser: 'babel'
      })
      const formattedTS = prettier.format(code, {
        ...prettierOptions,
        parser: 'typescript'
      })
      const tsCode = highlightCode(formattedTS, lang, theme)
      const jsCode = highlightCode(formattedJS, lang, theme)

      return `<LanguageBlock global-id="ts">${tsCode}</LanguageBlock><LanguageBlock global-id="js">${jsCode}</LanguageBlock>`
    }
    
    return highlightCode(code, lang, theme)
  }
}