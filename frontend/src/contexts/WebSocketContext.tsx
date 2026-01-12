import { createContext, useContext, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useAlert } from "./AlertContext";

type WSContextType = {
  wsRef: React.RefObject<WebSocket | null>;
  closeWS: () => void;
};

const WebSocketContext = createContext<WSContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, setUser } = useAuth();
  const { showAlert } = useAlert();
  const reconnectDelay = useRef(1000); // 1 second initial delay
  const reconnectTimer = useRef<number | null>(null);
  const manualCloseRef = useRef<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = (cancelled: boolean) => {
    if (cancelled) return;

    const token = localStorage.getItem('globalchat-authToken');
    if (!token) return;

    const wsUrl = import.meta.env.VITE_BACKEND_URL.replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsUrl}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      reconnectDelay.current = 1000; // reset delay on successful connection
    };

    ws.onerror = () => { ws.close(); }

    ws.onclose = (e) => {
      if (manualCloseRef.current) {
        manualCloseRef.current = false;
        console.log("WebSocket manually closed");
        return;
      }

      if (e.code === 1008) {
        localStorage.removeItem('globalchat-authToken');
        setUser(null);
        showAlert({ type: 'warning', message: 'Session expired. Please log in again.' });
        return;
      }

      if (cancelled || !user) return;

      console.log(`WebSocket disconnected, attempting to reconnect in ${reconnectDelay.current} ms`);
      showAlert({ type: 'warning', message: 'Disconnected from chat server. Reconnecting...' });

      reconnectTimer.current = window.setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000); // exponential backoff up to 30 seconds
        connectWebSocket(cancelled);
      }, reconnectDelay.current);
    };
  };

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    connectWebSocket(cancelled);

    return () => {
      cancelled = true;

      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user?._id]);

  const closeWS = () => {
    manualCloseRef.current = true;
    wsRef.current?.close();
    wsRef.current = null;
  };

  return (
    <WebSocketContext.Provider value={{ wsRef, closeWS }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = (): WSContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}