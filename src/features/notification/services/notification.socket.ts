let socket: WebSocket | null = null;
const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8080";
export function connectNotificationSocket(
  token: string,
  onMessage: (n: any) => void
) {
  socket = new WebSocket(
    `${BASE_URL}/notifications/ws?token=${token}`
  );

  socket.onmessage = (event) => {
    console.log("📩 WebSocket message received:", event.data);
  };
  socket.onopen = () => console.log("🔔 Notification socket connected");
  socket.onclose = () => console.log("🔕 Notification socket disconnected");
  socket.onerror = (e) => console.error("WS error", e);

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  return () => socket?.close();
}
