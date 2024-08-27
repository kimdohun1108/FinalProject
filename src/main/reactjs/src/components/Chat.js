import React, { useState, useEffect } from 'react';
import { useChat } from '@livekit/components-react';

function Chat() {
    const { send, chatMessages } = useChat();
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null); // error 상태를 정의합니다.

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            send(message)
                .then(() => setMessage(''))
                .catch(err => console.error('메시지 전송 실패:', err));
        }
    };

    useEffect(() => {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [chatMessages]);

    return (
        <div className="chat-container">
            <div id="chat-messages" className="chat-messages">
                {chatMessages && chatMessages.length > 0 ? (
                    chatMessages.map((msg, index) => (
                        <div key={msg.id || index} className="chat-message">
                            <strong>{msg.senderName || '알 수 없는 사용자'}:</strong>
                            <span>{msg.message}</span>
                        </div>
                    ))
                ) : (
                    <div>No chat messages</div>
                )}
            </div>
            <form className="chat-input-container" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="메세지를 입력하세요..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit" className="chat-send-button">
                    보내기
                </button>
            </form>
            {error && <div className="chat-error">채팅 오류: {error.message}</div>}
        </div>
    );
}

export default Chat;
