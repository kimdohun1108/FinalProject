import React, { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:6080/ws/chat');
    
    ws.onopen = () => {
      console.log('웹소켓 연결이 설정되었습니다.');
    };

    ws.onmessage = (event) => {
      console.log('메시지 수신됨:', event.data);
      setMessages((prevMessages) => [...prevMessages, `보내는 사람 : ${event.data}`]);
    };
  
    ws.onclose = () => {
      console.log('웹소켓 연결이 종료되었습니다.');
    };
  
    ws.onerror = (error) => {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    };

    setSocket(ws);
    
    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (socket && message) {
      socket.send(message);
      //setMessages((prevMessages) => [...prevMessages, `나: ${message}`]); // 나의 메시지를 화면에 추가
      setMessage(''); // 메시지 입력란 비우기
    }
    else {
      console.warn('소켓이 열려 있지 않거나 메시지가 비어 있습니다.');
    }
  };

  return (
      <div className="chat-container">
        <ul id="messages">
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
        <form onSubmit={sendMessage}>
          <input
            autoComplete="off"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요"
          />
          <button type="submit">Send</button>
        </form>
      </div>
  );
}

export default App;
