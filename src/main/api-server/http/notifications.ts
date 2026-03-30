/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import WebSocket from 'ws';

interface WebSocketWithHeartbeat extends WebSocket {
  isAlive?: boolean;
}

let wss: WebSocket.Server | null = null;
const clients = new Set<WebSocket>();

export function initializeWebSocketServer(server: any): void {
  wss = new WebSocket.Server({ server, perMessageDeflate: false });

  wss.on('connection', (ws: WebSocketWithHeartbeat, req) => {
    // Verify connection came from localhost (inherited from HTTP server's host validation)
    const clientIp = req.socket.remoteAddress;
    if (clientIp !== '127.0.0.1' && clientIp !== '::1' && !clientIp?.startsWith('127.0.0.1')) {
      console.warn(`WebSocket connection rejected from non-localhost address: ${clientIp}`);
      ws.close(1008, 'Forbidden');
      return;
    }

    clients.add(ws);
    ws.isAlive = true;

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });

    // Terminate idle connections after 30 seconds of no heartbeat
    const closeIdleConnection = setTimeout(() => {
      if (!ws.isAlive) {
        ws.terminate();
        clients.delete(ws);
      } else {
        ws.isAlive = false;
        ws.ping();
      }
    }, 30000);

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('close', () => {
      clearTimeout(closeIdleConnection);
    });
  });

  // Browser sends heartbeat pings periodically
  const heartbeatInterval = setInterval(() => {
    wss?.clients.forEach((ws: any) => {
      if (!ws.isAlive) {
        ws.terminate();
        clients.delete(ws);
        return;
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  // Clear heartbeat on server close
  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });
}

export function broadcast(eventType: string, data: any): void {
  if (!wss) {
    console.warn('WebSocket server not initialized');
    return;
  }

  // Sanitize message data to prevent injection attacks
  const message = JSON.stringify({ type: eventType, data });
  
  if (message.length > 1024 * 1024) { // 1MB message limit
    console.warn('WebSocket message too large, skipping broadcast');
    return;
  }

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message, (error) => {
        if (error) {
          console.error('Failed to send WebSocket message:', error);
          clients.delete(client);
        }
      });
    }
  });
}