function extractCodeLanguage(className: string) {
  if (!className) return ''
  const classes = className.split(/\s+/).filter(Boolean)
  for (const name of classes) {
    if (name.startsWith('language-')) return name.slice(9)
    if (name.startsWith('lang-')) return name.slice(5)
  }
  return classes[0] || ''
}

function enhanceCodeBlocks(root: HTMLElement, doc: Document) {
  const pres = Array.from(root.querySelectorAll('pre'))

  pres.forEach((pre) => {
    if (pre.parentElement?.classList.contains('code-preview')) return

    const code = pre.children.length === 1 && pre.firstElementChild?.tagName === 'CODE'
      ? (pre.firstElementChild as HTMLElement)
      : null

    if (!code) return

    const wrapper = doc.createElement('div')
    wrapper.className = 'code-preview'

    const header = doc.createElement('div')
    header.className = 'code-preview-bar'

    const lang = doc.createElement('span')
    lang.className = 'code-preview-lang'
    lang.textContent = extractCodeLanguage(code.className || '') || 'code'

    const copyBtn = doc.createElement('button')
    copyBtn.type = 'button'
    copyBtn.className = 'code-preview-copy'
    copyBtn.setAttribute('data-code-copy', '1')
    copyBtn.textContent = '复制'

    header.append(lang, copyBtn)
    wrapper.append(header)
    pre.classList.add('code-preview-pre')
    code.classList.add('code-preview-code')
    pre.replaceWith(wrapper)
    wrapper.append(pre)
  })
}

function enhanceFloorLinks(root: HTMLElement, doc: Document) {
  const walker = doc.createTreeWalker(root, 4)
  const textNodes: Text[] = []

  let current = walker.nextNode()
  while (current) {
    const textNode = current as Text
    const parent = textNode.parentElement
    if (
      parent &&
      !parent.closest('pre, code, a, button, textarea, script, style') &&
      /#\d+\b/.test(textNode.nodeValue || '')
    ) {
      textNodes.push(textNode)
    }
    current = walker.nextNode()
  }

  textNodes.forEach((textNode) => {
    const text = textNode.nodeValue || ''
    const fragment = doc.createDocumentFragment()
    const regex = /#(\d+)\b/g
    let lastIndex = 0
    let matched = false
    let match: RegExpExecArray | null

    while ((match = regex.exec(text))) {
      const index = match.index
      const prevChar = index > 0 ? text[index - 1] : ''
      if (prevChar && /[\w&;]/.test(prevChar)) continue

      matched = true
      fragment.append(text.slice(lastIndex, index))

      const anchor = doc.createElement('a')
      anchor.href = `#c_${match[1]}`
      anchor.className = 'floor-jump-link'
      anchor.setAttribute('data-floor-jump', match[1])
      anchor.textContent = `#${match[1]}`
      fragment.append(anchor)

      lastIndex = index + match[0].length
    }

    if (!matched) return

    fragment.append(text.slice(lastIndex))
    textNode.parentNode?.replaceChild(fragment, textNode)
  })
}

export function enhanceRichHtml(html: string, options: { enableFloorLinks?: boolean } = {}) {
  if (!html || typeof DOMParser === 'undefined') return html || ''

  const doc = new DOMParser().parseFromString(`<div id="rich-html-root">${html}</div>`, 'text/html')
  const root = doc.getElementById('rich-html-root')
  if (!root) return html

  enhanceCodeBlocks(root, doc)
  if (options.enableFloorLinks) enhanceFloorLinks(root, doc)

  return root.innerHTML
}

export function enhanceReplyTreeHtml(nodes: any[]): any[] {
  if (!Array.isArray(nodes)) return []

  return nodes.map((node) => ({
    ...node,
    replyHtml: enhanceRichHtml(node?.replyHtml || '', { enableFloorLinks: true }),
    children: enhanceReplyTreeHtml(node?.children || [])
  }))
}
