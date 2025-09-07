// Simple WebSocket implementation for testing
export class SimpleWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  
  constructor() {
    this.url = 'ws://localhost:6000/ws';
  }
  
  connect(playerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const fullUrl = `${this.url}/${playerId}`;
      console.log('SimpleWebSocket connecting to:', fullUrl);
      
      try {
        this.ws = new WebSocket(fullUrl);
        
        this.ws.onopen = () => {
          console.log('SimpleWebSocket connected!');
          resolve();
        };
        
        this.ws.onerror = (error) => {
          console.error('SimpleWebSocket error:', error);
          reject(error);
        };
        
        this.ws.onmessage = (event) => {
          console.log('SimpleWebSocket message:', event.data);
        };
        
        this.ws.onclose = () => {
          console.log('SimpleWebSocket closed');
        };
        
      } catch (error) {
        console.error('SimpleWebSocket creation failed:', error);
        reject(error);
      }
    });
  }
  
  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('SimpleWebSocket not connected');
    }
  }
  
  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}