const API_URL = "https://nyrvu6zdu1.execute-api.ap-northeast-3.amazonaws.com/chat"

// marked の設定
marked.setOptions({
  breaks: true,
  gfm: true,
})

// シンタックスハイライトを有効化
marked.use({
  renderer: (() => {
    const renderer = new marked.Renderer()
    renderer.code = (code, lang) => {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      const highlighted = hljs.highlight(code, { language }).value
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
    }
    return renderer
  })()
})

const conversationHistory = []

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

// textarea の高さを内容に合わせて自動調整
function autoResize(el) {
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 140) + 'px'
}

document.getElementById('message').addEventListener('input', function () {
  autoResize(this)
})

function appendMessage(role, htmlContent) {
  const chat = document.getElementById('chat')

  const msg = document.createElement('div')
  msg.className = `msg ${role}`

  const avatar = document.createElement('div')
  avatar.className = 'msg-avatar'
  avatar.textContent = role === 'user' ? 'U' : '◈'

  const bubble = document.createElement('div')
  bubble.className = 'msg-bubble'
  bubble.innerHTML = htmlContent

  msg.appendChild(avatar)
  msg.appendChild(bubble)
  chat.appendChild(msg)

  chat.closest('.chat-wrapper').scrollTop = 99999
  return bubble
}

function showTyping() {
  const chat = document.getElementById('chat')

  const msg = document.createElement('div')
  msg.className = 'msg ai'
  msg.id = 'typing-indicator'

  const avatar = document.createElement('div')
  avatar.className = 'msg-avatar'
  avatar.textContent = '◈'

  const bubble = document.createElement('div')
  bubble.className = 'msg-bubble typing-bubble'
  bubble.innerHTML = '<span></span><span></span><span></span>'

  msg.appendChild(avatar)
  msg.appendChild(bubble)
  chat.appendChild(msg)

  chat.closest('.chat-wrapper').scrollTop = 99999
}

function removeTyping() {
  const el = document.getElementById('typing-indicator')
  if (el) el.remove()
}

async function send() {
  const input = document.getElementById('message')
  const message = input.value.trim()

  if (!message) return

  // ユーザーメッセージ表示（プレーンテキスト）
  appendMessage('user', escapeHtml(message))

  input.value = ''
  input.style.height = 'auto'

  // 履歴にユーザーメッセージ追加
  conversationHistory.push({ role: 'user', content: message })

  // 送信ボタンを無効化 & タイピング表示
  document.getElementById('send-btn').disabled = true
  showTyping()

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        history: conversationHistory,
      }),
    })

    // const data = await res.json()
    // const responseText = data.response || '(応答なし)'

    // removeTyping()

    // // AI返答をMarkdownとして表示
    // appendMessage('ai', marked.parse(responseText))

    // // 履歴にAI返答を追加
    // conversationHistory.push({ role: 'assistant', content: responseText })
    const data = await res.json()

    removeTyping()

    const responses = data.responses || ['(応答なし)']

    responses.forEach(res => {
      appendMessage('ai', marked.parse(res))

      // conversationHistory.push({
      //   role: 'assistant',
      //   content: res
      // })
    })

  } catch (err) {
    removeTyping()
    appendMessage('ai', `<span style="color:#ff6b6b">エラーが発生しました: ${escapeHtml(err.message)}</span>`)
  } finally {
    document.getElementById('send-btn').disabled = false
    input.focus()
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
