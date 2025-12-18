import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationService } from "./services/notification.service";
import type { Notification } from "./types";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async () => {
    return await notificationService.getMyNotifications();
  }
);

export const markRead = createAsyncThunk(
  "notifications/markRead",
  async (id: number) => {
    await notificationService.markAsRead(id);
    return id;
  }
);

export const markUnread = createAsyncThunk(
  "notifications/markUnread",
  async (id: number) => {
    await notificationService.markAsUnread(id);
    return id;
  }
);

export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id: number) => {
    await notificationService.delete(id);
    return id;
  }
);

export const markAll = createAsyncThunk(
  "notifications/markAll",
  async () => {
    await notificationService.markAllAsRead();
    return true;
  }
);

interface State {
  list: Notification[];
  loading: boolean;
}

const initialState: State = {
  list: [],
  loading: false,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload ?? [];
        state.loading = false;
      })
      .addCase(markRead.fulfilled, (state, action) => {
        const n = state.list.find((i) => i.id === action.payload);
        if (n) n.is_read = true;
      })
      .addCase(markUnread.fulfilled, (state, action) => {
        const n = state.list.find((i) => i.id === action.payload);
        if (n) n.is_read = false;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.list = state.list.filter((n) => n.id !== action.payload);
      })
      .addCase(markAll.fulfilled, (state) => {
        state.list.forEach((n) => (n.is_read = true));
      });
  },
});

export default notificationSlice.reducer;
