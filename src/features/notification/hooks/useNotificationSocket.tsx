import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { pushNotification } from "../slice";
import { connectNotificationSocket } from "../services/notification.socket";

export function useNotificationSocket(token: string | null) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) return;

    const disconnect = connectNotificationSocket(token, (n) => {
      dispatch(pushNotification(n));
    });

    return disconnect;
  }, [token, dispatch]);
}
