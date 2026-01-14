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

export const archiveNotification = createAsyncThunk(
  "notifications/archive",
  async (id: number, { rejectWithValue }) => {
    try {
      await notificationService.markAsArchived(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Archive failed");
    }
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

export const archiveAllNotifications = createAsyncThunk(
  "notifications/archiveAll",
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsArchived();
      return true;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Archive all failed"
      );
    }
  }
);

export const sendTeamNotification = createAsyncThunk(
  "notifications/sendTeam",
  async (payload: {
    recipient_type: "single" | "multiple" | "all_reps" | "all_managers" | "all_team";
    target_user_ids?: number[];
    category?: string;
    message_title: string;
    message_body: string;
  }) => {
    await notificationService.sendToTeam(payload);
  }
);

interface State {
  list: Notification[];
  loading: boolean;
  sending: boolean;
  archiving: boolean;
  archiveError?: string;
}

const initialState: State = {
  list: [],
  loading: false,
  sending: false,
  archiving: false,
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
     clearArchiveError: (state) => {
      state.archiveError = undefined;
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
      })

      .addCase(archiveNotification.pending, (state) => {
        state.archiving = true;
        state.archiveError = undefined;
      })

      .addCase(archiveNotification.fulfilled, (state, action) => {
        state.archiving = false;
        state.list = state.list.filter((n) => n.id !== action.payload);
      })

      .addCase(archiveNotification.rejected, (state, action) => {
        state.archiving = false;
        state.archiveError = action.payload as string;
      })

      .addCase(archiveAllNotifications.pending, (state) => {
  state.archiving = true;
  state.archiveError = undefined;
})

.addCase(archiveAllNotifications.fulfilled, (state) => {
  state.archiving = false;
  state.list = []; // clear all notifications
})

.addCase(archiveAllNotifications.rejected, (state, action) => {
  state.archiving = false;
  state.archiveError = action.payload as string;
})

.addCase(sendTeamNotification.pending, (state) => {
  state.sending = true;
})
.addCase(sendTeamNotification.fulfilled, (state) => {
  state.sending = false;
})
.addCase(sendTeamNotification.rejected, (state) => {
  state.sending = false;
})



  },
});

export const { pushNotification, clearArchiveError } = notificationSlice.actions;
export default notificationSlice.reducer;
