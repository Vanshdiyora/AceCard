import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import type { Notification } from "./types";

const selectNotificationState = (state: RootState) =>
  state.notifications;

export const selectNotifications = createSelector(
  [selectNotificationState],
  (state) => state.list
);

export const selectUnreadCount = createSelector(
  [selectNotifications],
  (list: Notification[]) => list.filter((n) => !n.is_read).length
);
