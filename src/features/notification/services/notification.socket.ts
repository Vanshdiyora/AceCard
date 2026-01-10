let socket: WebSocket | null = null;

export function connectNotificationSocket(
  token: string,
  onMessage: (n: any) => void
) {
  socket = new WebSocket(
    `${import.meta.env.VITE_WS_URL}/notifications/ws?token=${token}`
  );

  socket.onopen = () => console.log("🔔 Notification socket connected");
  socket.onclose = () => console.log("🔕 Notification socket disconnected");
  socket.onerror = (e) => console.error("WS error", e);

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  return () => socket?.close();
}
