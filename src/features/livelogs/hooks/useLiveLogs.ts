import { useEffect, useRef, useState } from "react";
import type { ServerLog } from "../types";

export function useLiveLogs(token: string) {
  const [logs, setLogs] = useState<ServerLog[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    const ws = new WebSocket(
      `wss://api.theacecard.co/admin/logs/ws?token=${token}`
    );

    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const parsed: ServerLog = JSON.parse(event.data);

      setLogs((prev) => {
        const updated = [...prev, parsed];
        return updated.slice(-500); // keep last 500 logs
      });
    };

    ws.onclose = () => {
      setConnected(false);

      reconnectTimer.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  };

  useEffect(() => {
    connect();

    return () => {
      wsRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, []);

  return { logs, connected };
}