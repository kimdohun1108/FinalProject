import React, { useState, useEffect } from 'react';
import { useChat } from '@livekit/components-react';

function Chat() {
    const { send, chatMessages } = useChat();
    const [message, setMessage] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() !== '') {
            send(message); // 메시지를 전송합니다.
            setMessage(''); // 입력 필드를 비웁니다.
        }
    };

    useEffect(() => {
        // 채팅 메시지가 새로 추가될 때마다 스크롤을 아래로 이동합니다.
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [chatMessages]);

    return (
        <div className="chat-container">
            <div id="chat-messages" className="chat-messages">
                {chatMessages.map((msg, index) => (
                    <div key={index} className="chat-message">
                        <strong>{msg.senderName}: </strong>
                        <span>{msg.message}</span>
                    </div>
                ))}
            </div>
            <form className="chat-input-container" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit" className="chat-send-button">
                    Send
                </button>
            </form>
        </div>
    );
}

export default Chat;
