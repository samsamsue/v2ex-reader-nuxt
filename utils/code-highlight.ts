function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function wrapToken(type: string, text: string) {
  return `<span class="code-token-${type}">${escapeHtml(text)}</span>`
}

function protectTokens(source: string, patterns: Array<{ type: string; regex: RegExp }>) {
  const stash: string[] = []
  let output = source

  for (const { type, regex } of patterns) {
    output = output.replace(regex, (match) => {
      const token = `__CODE_TOKEN_${stash.length}__`
      stash.push(wrapToken(type, match))
      return token
    })
  }

  return {
    output,
    restore(text: string) {
      return text.replace(/__CODE_TOKEN_(\d+)__/g, (_, index) => stash[Number(index)] || '')
    }
  }
}

function highlightKeywords(source: string, keywords: string[]) {
  if (!keywords.length) return escapeHtml(source)
  const pattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g')
  return escapeHtml(source).replace(pattern, '<span class="code-token-keyword">$1</span>')
}

function highlightCommon(source: string, keywords: string[]) {
  const protectedText = protectTokens(source, [
    { type: 'comment', regex: /\/\*[\s\S]*?\*\//g },
    { type: 'comment', regex: /(^|\s)(\/\/.*)$/gm },
    { type: 'string', regex: /`(?:\\[\s\S]|[^`])*`/g },
    { type: 'string', regex: /'(?:\\.|[^'\\])*'/g },
    { type: 'string', regex: /"(?:\\.|[^"\\])*"/g }
  ])

  let highlighted = highlightKeywords(protectedText.output, keywords)
  highlighted = highlighted.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="code-token-number">$1</span>')
  return protectedText.restore(highlighted)
}

function highlightShell(source: string) {
  const protectedText = protectTokens(source, [
    { type: 'comment', regex: /(^|\s)(#.*)$/gm },
    { type: 'string', regex: /'(?:\\.|[^'\\])*'/g },
    { type: 'string', regex: /"(?:\\.|[^"\\])*"/g }
  ])

  let highlighted = escapeHtml(protectedText.output)
  highlighted = highlighted.replace(/\b(if|then|else|elif|fi|for|do|done|case|esac|while|function|in|export|sudo)\b/g, '<span class="code-token-keyword">$1</span>')
  highlighted = highlighted.replace(/\$(\w+|\{[^}]+\})/g, '<span class="code-token-number">$$$1</span>')
  highlighted = highlighted.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="code-token-number">$1</span>')
  return protectedText.restore(highlighted)
}

function highlightPython(source: string) {
  return highlightCommon(source, [
    'def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally',
    'with', 'as', 'import', 'from', 'pass', 'break', 'continue', 'lambda', 'yield', 'async',
    'await', 'True', 'False', 'None', 'in', 'is', 'and', 'or', 'not'
  ]).replace(/(^|\s)(#.*)$/gm, (_, prefix, comment) => `${prefix}<span class="code-token-comment">${escapeHtml(comment)}</span>`)
}

function highlightJson(source: string) {
  let html = escapeHtml(source)
  html = html.replace(/("(?:\\.|[^"\\])*")(\s*:)/g, '<span class="code-token-attr">$1</span>$2')
  html = html.replace(/:\s*("(?:\\.|[^"\\])*")/g, ': <span class="code-token-string">$1</span>')
  html = html.replace(/\b(true|false|null)\b/g, '<span class="code-token-keyword">$1</span>')
  html = html.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="code-token-number">$1</span>')
  return html
}

function highlightHtmlLike(source: string) {
  let html = escapeHtml(source)
  html = html.replace(/(&lt;\/?)([A-Za-z0-9:-]+)/g, '$1<span class="code-token-tag">$2</span>')
  html = html.replace(/([A-Za-z-:]+)=/g, '<span class="code-token-attr">$1</span>=')
  html = html.replace(/("(?:\\.|[^"\\])*")/g, '<span class="code-token-string">$1</span>')
  html = html.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="code-token-comment">$1</span>')
  return html
}

function highlightCss(source: string) {
  const protectedText = protectTokens(source, [
    { type: 'comment', regex: /\/\*[\s\S]*?\*\//g },
    { type: 'string', regex: /"(?:\\.|[^"\\])*"/g },
    { type: 'string', regex: /'(?:\\.|[^'\\])*'/g }
  ])

  let html = escapeHtml(protectedText.output)
  html = html.replace(/([.#]?[A-Za-z_-][A-Za-z0-9_-]*)\s*(?=\{)/g, '<span class="code-token-tag">$1</span>')
  html = html.replace(/([A-Za-z-]+)(\s*:)/g, '<span class="code-token-attr">$1</span>$2')
  html = html.replace(/\b(\d+(?:\.\d+)?)(px|rem|em|vh|vw|%|s|ms)?\b/g, '<span class="code-token-number">$1$2</span>')
  return protectedText.restore(html)
}

function highlightYaml(source: string) {
  let html = escapeHtml(source)
  html = html.replace(/(^|\n)(\s*)([A-Za-z0-9_-]+)(:)/g, '$1$2<span class="code-token-attr">$3</span>$4')
  html = html.replace(/(^|\s)(#.*)$/gm, '$1<span class="code-token-comment">$2</span>')
  html = html.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, '<span class="code-token-string">$1</span>')
  html = html.replace(/\b(true|false|null)\b/g, '<span class="code-token-keyword">$1</span>')
  html = html.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="code-token-number">$1</span>')
  return html
}

function highlightSql(source: string) {
  return highlightCommon(source, [
    'select', 'from', 'where', 'and', 'or', 'insert', 'into', 'update', 'delete', 'join', 'left',
    'right', 'inner', 'outer', 'on', 'group', 'by', 'order', 'limit', 'offset', 'as', 'create',
    'table', 'drop', 'alter', 'values', 'set', 'distinct', 'case', 'when', 'then', 'end'
  ])
}

function highlightPhp(source: string) {
  let html = highlightCommon(source, [
    'function', 'class', 'public', 'private', 'protected', 'return', 'if', 'else', 'elseif', 'foreach',
    'for', 'while', 'switch', 'case', 'break', 'continue', 'namespace', 'use', 'new', 'extends',
    'implements', 'const', 'static', 'try', 'catch', 'finally', 'throw', 'true', 'false', 'null'
  ])
  html = html.replace(/\$[A-Za-z_][A-Za-z0-9_]*/g, '<span class="code-token-number">$&</span>')
  return html
}

export function highlightCode(code: string, language = '') {
  const lang = (language || '').toLowerCase()

  if (['bash', 'shell', 'sh', 'zsh'].includes(lang)) return highlightShell(code)
  if (['python', 'py'].includes(lang)) return highlightPython(code)
  if (['json'].includes(lang)) return highlightJson(code)
  if (['html', 'xml', 'vue'].includes(lang)) return highlightHtmlLike(code)
  if (['css', 'scss', 'less'].includes(lang)) return highlightCss(code)
  if (['yaml', 'yml', 'toml'].includes(lang)) return highlightYaml(code)
  if (['sql'].includes(lang)) return highlightSql(code)
  if (['php'].includes(lang)) return highlightPhp(code)

  return highlightCommon(code, [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'switch', 'case', 'break', 'continue',
    'for', 'while', 'class', 'new', 'import', 'from', 'export', 'default', 'async', 'await', 'try',
    'catch', 'finally', 'true', 'false', 'null', 'undefined', 'typeof', 'instanceof'
  ])
}

export function applyCodeHighlighting(root: ParentNode | null) {
  if (!root || typeof document === 'undefined') return

  const codeBlocks = Array.from(root.querySelectorAll('pre code')) as HTMLElement[]
  codeBlocks.forEach((block) => {
    const raw = block.textContent || ''
    const langClass = Array.from(block.classList).find((name) => name.startsWith('language-') || name.startsWith('lang-')) || ''
    const language = langClass.replace(/^language-/, '').replace(/^lang-/, '')
    block.innerHTML = highlightCode(raw, language)
  })
}
