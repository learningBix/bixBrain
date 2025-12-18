// Network utility functions for managing global IP address

// Get the current global IP address, fallback to default if not set
export const getGlobalIP = (): string => {
  return (global as any).projectIP || '192.168.4.1';
};

// Get the current global IP address with port
export const getGlobalIPWithPort = (port: number = 5000): string => {
  return `${getGlobalIP()}:${port}`;
};

// Get the current global IP address for HTTP requests
export const getGlobalHTTPURL = (port: number = 81): string => {
  return `http://${getGlobalIP()}:${port}`;
};

// Get the current global IP address for WebSocket connections
export const getGlobalWebSocketURL = (port: number = 81): string => {
  return `ws://${getGlobalIP()}:${port}`;
};

// Send UDP message to global IP
export const sendUDPToGlobalIP = (
  message: string, 
  port: number = 5000,
  callback?: (error: any) => void
): void => {
  const dgram = require('react-native-udp');
  const client = dgram.createSocket('udp4');
  
  client.send(message, 0, message.length, port, getGlobalIP(), (error: any) => {
    if (callback) {
      callback(error);
    }
    client.close();
  });
};

// Send HTTP request to global IP
export const sendHTTPToGlobalIP = async (
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any,
  port: number = 81
): Promise<any> => {
  const url = `${getGlobalHTTPURL(port)}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  return response.json();
}; 