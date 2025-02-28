// components/Sidebar.js
import React from 'react';
import './Sidebar.css';

function Sidebar({ conversations, startNewChat }) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const previousWeek = new Date(today);
  previousWeek.setDate(previousWeek.getDate() - 7);
  
  // Group conversations by date
  const groupedConversations = {
    today: [],
    yesterday: [],
    previousWeek: [],
    older: []
  };
  
  conversations.forEach(convo => {
    const convoDate = new Date(convo.date);
    if (convoDate.toDateString() === today.toDateString()) {
      groupedConversations.today.push(convo);
    } else if (convoDate.toDateString() === yesterday.toDateString()) {
      groupedConversations.yesterday.push(convo);
    } else if (convoDate >= previousWeek) {
      groupedConversations.previousWeek.push(convo);
    } else {
      groupedConversations.older.push(convo);
    }
  });

  return (
    <div className="sidebar">
      <div className="top-items">
        <div className="nav-item active">
          <span className="icon">⊙</span>
          <span>ChatGPT</span>
        </div>
        
        <div className="nav-item">
          <span className="icon">🖼️</span>
          <span>image generator</span>
        </div>
        
        <div className="nav-item">
          <span className="icon">⊛</span>
          <span>Explore GPTs</span>
        </div>
      </div>
      
      <div className="conversations">
        <div className="new-chat" onClick={startNewChat}>
          <span>+ New chat</span>
        </div>
        
        {groupedConversations.today.length > 0 && (
          <div className="date-group">
            <h3>Today</h3>
            {groupedConversations.today.map(convo => (
              <div key={convo.id} className="conversation-item">
                {convo.title}
              </div>
            ))}
          </div>
        )}
        
        {groupedConversations.yesterday.length > 0 && (
          <div className="date-group">
            <h3>Yesterday</h3>
            {groupedConversations.yesterday.map(convo => (
              <div key={convo.id} className="conversation-item">
                {convo.title}
              </div>
            ))}
          </div>
        )}
        
        {groupedConversations.previousWeek.length > 0 && (
          <div className="date-group">
            <h3>Previous 7 Days</h3>
            {groupedConversations.previousWeek.map(convo => (
              <div key={convo.id} className="conversation-item">
                {convo.title}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="upgrade-plan">
        <div className="icon">◎</div>
        <div className="upgrade-text">
          <strong>Upgrade plan</strong>
          <div className="sub-text">More access to the best models</div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;