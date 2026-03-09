const API_URL = "https://nyrvu6zdu1.execute-api.ap-northeast-3.amazonaws.com/chat"

async function send(){

  const input = document.getElementById("message")
  const chat = document.getElementById("chat")

  const message = input.value

  if(!message) return

  chat.innerHTML += `<div class="user">${message}</div>`

  input.value = ""

  const res = await fetch(API_URL,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      message:message
    })
  })

  const data = await res.json()

  chat.innerHTML += `<div class="ai">${data.response}</div>`

  chat.scrollTop = chat.scrollHeight
}