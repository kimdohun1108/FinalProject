import React, { useState, useEffect } from 'react';
import { useChat } from '@livekit/components-react';

function Chat() {
    const { send, chatMessages } = useChat();
    const [message, setMessage] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            send(message);
            setMessage('');
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
                {chatMessages.map((msg, index) => (
                    <div key={msg.id || index} className="chat-message">
                        <strong>{msg.senderName || 'Unknown'}: </strong>
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
