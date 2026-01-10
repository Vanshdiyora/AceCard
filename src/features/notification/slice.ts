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

// 🔹 Admin send
export const sendVendorNotification = createAsyncThunk(
  "notifications/sendVendor",
  async (payload: {
    vendor_ids: number[];
    title: string;
    body: string;
    in_app: boolean;
    email: boolean;
  }) => {
    await notificationService.sendToVendors(payload);
  }
);

interface State {
  list: Notification[];
  loading: boolean;
  sending: boolean;
}

const initialState: State = {
  list: [],
  loading: false,
  sending: false,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    pushNotification: (state, action) => {
      state.list.unshift({
        ...action.payload,
        is_read: action.payload.status === "read",
      });
    },
  },
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
      })

      .addCase(sendVendorNotification.pending, (state) => {
        state.sending = true;
      })
      .addCase(sendVendorNotification.fulfilled, (state) => {
        state.sending = false;
      })
      .addCase(sendVendorNotification.rejected, (state) => {
        state.sending = false;
      });
  },
});

export const { pushNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
