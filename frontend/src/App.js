import React from 'react';
import NotificationList from './components/notifications/NotificationList';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>TrashToTreasure - Waste Management Platform</h1>
      </header>
      <main>
        <NotificationList />
      </main>
    </div>
  );
}

export default App;
