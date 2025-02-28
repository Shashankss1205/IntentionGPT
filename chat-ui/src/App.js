// App.js (Updated)
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import PromptInput from './components/PromptInput';
import { fetchResponse } from './services/api';

function App() {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [memoryFull, setMemoryFull] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat]);

  const handleSendMessage = async (message, attachedFiles = []) => {
    if (!message.trim() && attachedFiles.length === 0) return;

    setIsLoading(true);
    try {
      // Verify files before sending
      console.log(`Sending ${attachedFiles.length} files`);
      attachedFiles.forEach((file, i) => {
        console.log(`File ${i}: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
      });

      const userMessage = { role: 'user', content: message };
      setCurrentChat(prev => [...prev, userMessage]);
      // Send request with files
      const aiResponse = await fetchResponse(message, currentChat, attachedFiles);
      console.log('AI response:', aiResponse);

      const assistantMessage = { role: 'assistant', content: aiResponse };
      setCurrentChat(prev => [...prev, assistantMessage]);

      // If this is a new conversation, add it to the sidebar
      if (currentChat.length === 0) {
        const newConversation = {
          id: Date.now().toString(),
          title: message.slice(0, 30) + (message.length > 30 ? '...' : ''),
          date: new Date()
        };
        setConversations(prev => [newConversation, ...prev]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setCurrentChat(prev => [...prev, {
        role: 'error',
        content: 'Sorry, there was an error processing your request.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setCurrentChat([]);
  };

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        startNewChat={startNewChat}
      />
      <main className="main-content">
        <div className="header">
          <h2>IntentionGPT</h2>
          <div className="memory-status">
            Memory Full {memoryFull ? 'ⓘ' : 'ⓘ'}
          </div>
        </div>

        <ChatWindow
          messages={currentChat}
          isLoading={isLoading}
          chatEndRef={chatEndRef}
        />

        <PromptInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default App;