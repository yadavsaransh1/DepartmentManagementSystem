import React, { useState, useEffect, useRef } from 'react';
import { apiFetch, API_BASE_URL, PHI_API_BASE_URL } from '../utils/apiClient';
import './PhiChat.css';

export const PhiChat = ({ userType, userInfo, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Generate storage key based on user type and ID
  const storageKey = `phi-chat-${userType}-${userInfo?.id || 'guest'}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(storageKey);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (err) {
        console.error('Error loading chat history:', err);
      }
    }
    
    // Check if Phi service is running
    fetch(`${PHI_API_BASE_URL}/api/phi/health`)
      .then(res => setIsConnected(res.ok))
      .catch(() => setIsConnected(false));
  }, [storageKey]);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  const getTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || !isConnected) return;

    const userMessage = input;
    setInput('');
    setMessages([...messages, { role: 'user', content: userMessage, timestamp: getTime() }]);
    setLoading(true);

    try {
      const response = await fetch(`${PHI_API_BASE_URL}/api/phi/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userInfo.id || 'guest',
          userType: userType,
          message: userMessage,
          userInfo: userInfo
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.message) {
        // Response can be HTML or plain text
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.message, 
          timestamp: getTime(),
          isHtml: data.message.includes('<') // Mark if response contains HTML
        }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '❌ Error: ' + data.error, 
          timestamp: getTime() 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '❌ Invalid response from server', 
          timestamp: getTime() 
        }]);
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'âŒ Connection error. Make sure Phi service is running on port 5000.', timestamp: getTime() }]);
    }

    setLoading(false);
  };

  const getIconAndTitle = () => {
    const config = {
      student: { icon:  '🎓', title: "Phi - Student Assistant", color: '#4CAF50' },
      teacher: { icon: '👨‍🏫', title: "Phi - Teacher Assistant", color: '#2196F3' },
      admin: { icon: '⚙️', title: "Phi - Admin Assistant", color: '#FF9800' }
    };
    return config[userType] || config.student;
  };

  const config = getIconAndTitle();

  return (
    <div className="phi-chat-container">
      <div className="phi-chat-header" style={{ backgroundColor: config.color }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>{config.icon}</span>
          <h2 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
            {config.title}
          </h2>
        </div>
        <button className="phi-close-btn" onClick={onClose} title="Close">✕</button>
      </div>

      <div className="phi-chat-messages">
        {messages.length === 0 && (
          <div className="phi-welcome-message">
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🤖</div>
            <h3>Hello! 👋</h3>
            <p>I'm Phi, your AI Assistant powered by Microsoft</p>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '15px' }}>
              Ask me anything! I can help with academics, concepts, explanations, problem-solving, and much more.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`phi-message phi-message-${msg.role}`}>
            {msg.role === 'assistant' && <span className="phi-message-icon">{config.icon}</span>}
            <div className={`phi-message-bubble phi-bubble-${msg.role}`}>
              {msg.role === 'assistant' && msg.isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: msg.content }} />
              ) : (
                msg.content
              )}
              {msg.timestamp && (
                <div style={{ fontSize: '11px', color: '#999', marginTop: '8px', textAlign: 'right' }}>
                  {msg.timestamp}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="phi-message phi-message-assistant">
            <span className="phi-message-icon">{config.icon}</span>
            <div className="phi-message-bubble phi-bubble-assistant phi-typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {!isConnected && (
        <div style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          fontSize: '12px',
          borderTop: '1px solid #f5c6cb',
          textAlign: 'center'
        }}>
          âš ï¸ Phi service not available. Make sure it's running on port 5000.
        </div>
      )}

      <form onSubmit={sendMessage} className="phi-chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isConnected ? "Ask me anything..." : "Service unavailable..."}
          disabled={loading || !isConnected}
          className="phi-chat-input"
        />
        <button
          type="submit"
          disabled={loading || !isConnected || !input.trim()}
          className="phi-chat-send-btn"
        >
          {loading ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  );
};

export default PhiChat;

