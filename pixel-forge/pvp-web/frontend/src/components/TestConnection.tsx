import React, { useState } from 'react';
import { SimpleWebSocket } from '../services/simpleWebsocket';

export const TestConnection: React.FC = () => {
  const [status, setStatus] = useState('Not connected');
  const [ws, setWs] = useState<SimpleWebSocket | null>(null);
  
  const testConnection = async () => {
    setStatus('Connecting...');
    const simpleWs = new SimpleWebSocket();
    
    try {
      await simpleWs.connect('test_player_' + Date.now());
      setStatus('Connected!');
      setWs(simpleWs);
      
      // Send test message
      setTimeout(() => {
        simpleWs.send({
          type: 'find_match',
          data: { player_name: 'TestPlayer' },
          timestamp: Date.now()
        });
        setStatus('Connected and message sent!');
      }, 1000);
    } catch (error) {
      setStatus('Connection failed: ' + error);
      console.error('Connection error:', error);
    }
  };
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'black', 
      color: 'white', 
      padding: 10,
      border: '1px solid cyan',
      zIndex: 9999 
    }}>
      <h3>WebSocket Test</h3>
      <p>Status: {status}</p>
      <button onClick={testConnection}>Test Connection</button>
    </div>
  );
};