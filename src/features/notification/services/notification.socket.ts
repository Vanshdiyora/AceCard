let socket: WebSocket | null = null;

const BASE_URL = "wss://api.theacecard.co";

export function connectNotificationSocket(
  token: string,
  onMessage: (n: any) => void
) {
  socket = new WebSocket(`${BASE_URL}/notifications/ws?token=${token}`);

  socket.onerror = (e) => console.error("WS error", e);

  socket.onmessage = (event) => {
    try {
      const raw = JSON.parse(event.data);

      if (raw.type === "notification" && raw.data) {
        const n = raw.data;

        const normalized = {
          ...n,
          created_at: n.created_at
            ? new Date(n.created_at).toISOString()
            : new Date().toISOString(),
        };

        onMessage(normalized);
      }
    } catch (err) {
      console.error("Failed to parse WS message", err, event.data);
    }
  };

  return () => socket?.close();
}