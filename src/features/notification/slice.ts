import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationService } from "./services/notification.service";
import type { Notification } from "./types";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async () => {
    const res = await notificationService.getMyNotifications();

    const list = res.data ?? [];

    return list.map((n: any) => ({
      ...n,
      is_read: n.status === "read",
    }));
  }
);


export const markRead = createAsyncThunk(
  "notifications/markRead",
  async (id: number) => {
    await notificationService.markAsRead(id);
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
        if (n) {
          n.is_read = true;
          n.status = "read";
        }
      })
      .addCase(markAll.fulfilled, (state) => {
        state.list.forEach((n) => {
          n.is_read = true;
          n.status = "read";
        });
      });
  },
});

export default notificationSlice.reducer;
