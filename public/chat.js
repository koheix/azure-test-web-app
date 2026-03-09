const API_URL = "https://nyrvu6zdu1.execute-api.ap-northeast-3.amazonaws.com/chat"

// 会話履歴を保持
const conversationHistory = []

async function send() {
  const input = document.getElementById("message")
  const chat = document.getElementById("chat")
  const message = input.value

  if (!message) return

  chat.innerHTML += `<div class="user">${message}</div>`
  input.value = ""

  // 履歴にユーザーメッセージを追加
  conversationHistory.push({ role: "user", content: message })

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: message,
      history: conversationHistory  // 履歴を追加して送信
    })
  })

  const data = await res.json()

  chat.innerHTML += `<div class="ai">${data.response}</div>`
  chat.scrollTop = chat.scrollHeight

  // 履歴にAIの返答を追加
  conversationHistory.push({ role: "assistant", content: data.response })
}