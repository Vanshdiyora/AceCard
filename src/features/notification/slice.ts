import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationService } from "./services/notification.service";
import type { Notification, SentNotification } from "./types";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async ({ page = 1 }: { page?: number }) => {
    const res = await notificationService.getMyNotifications(page);
    const apiMeta = (res.meta ?? {}) as {
      page?: number;
      page_size?: number;
      total_pages?: number;
      has_next?: boolean;
      total_unread_count?: number;
    };

    return {
      list: (res.data ?? []).map((n: any) => ({
        ...n,
        is_read: n.status === "read",
      })),
      meta: {
        page: apiMeta.page ?? page,
        page_size: apiMeta.page_size ?? 10,
        total_pages: apiMeta.total_pages ?? 1,
        has_next: apiMeta.has_next ?? false,
        total_unread_count: apiMeta.total_unread_count,
      },
      page,
    };
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

export const fetchSentNotifications = createAsyncThunk(
  "notifications/fetchSent",
  async ({
    page = 1,
    page_size = 10,
    search,
  }: {
    page?: number;
    page_size?: number;
    search?: string;
  }) => {
    const res = await notificationService.getSentNotifications(
      page,
      page_size,
      search
    );

    return res;
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
  unreadCount: number;
  meta?: {
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    total_unread_count?: number;
  };
  sentList: SentNotification[];
  sentLoading: boolean;
  sentMeta?: {
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

const initialState: State = {
  list: [],
  loading: false,
  sending: false,
  archiving: false,
  unreadCount: 0,
  meta: undefined,
  sentList: [],
  sentLoading: false,
  sentMeta: undefined,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    pushNotification: (state, action) => {
      const normalized = {
        ...action.payload,
        is_read: action.payload.status === "read",
      };

      state.list.unshift(normalized);
      if (!normalized.is_read) {
        state.unreadCount += 1;
      }
    },
    clearArchiveError: (state) => {
      state.archiveError = undefined;
    },
    resetSentNotifications: (state) => {
  state.sentList = [];
  state.sentMeta = undefined;
}
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const { list, meta, page } = action.payload;
        const unreadFromMeta = (meta as { total_unread_count?: number } | undefined)
          ?.total_unread_count;

        if (page === 1) {
          state.list = list;
        } else {
          const existing = new Set(state.list.map((n) => n.id));
          const filtered = list.filter((n) => !existing.has(n.id));
          state.list.push(...filtered);
        }

        state.meta = meta;
        if (typeof unreadFromMeta === "number") {
          state.unreadCount = unreadFromMeta;
        } else if (page === 1) {
          state.unreadCount = state.list.filter((n) => !n.is_read).length;
        }
        state.loading = false;
      })
      .addCase(markRead.fulfilled, (state, action) => {
        const n = state.list.find((i) => i.id === action.payload);
        if (n && !n.is_read) {
          n.is_read = true;
          n.status = "read";
          if (state.unreadCount > 0) state.unreadCount -= 1;
        }
      })

      .addCase(markAll.fulfilled, (state) => {
        state.list.forEach((n) => {
          n.is_read = true;
          n.status = "read";
        });
        state.unreadCount = 0;
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
        const archived = state.list.find((n) => n.id === action.payload);
        if (archived && !archived.is_read && state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
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
        state.unreadCount = 0;
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

      .addCase(fetchSentNotifications.pending, (state) => {
        state.sentLoading = true;
      })

.addCase(fetchSentNotifications.fulfilled, (state, action) => {
  const { data, meta } = action.payload;
  const page = action.meta.arg.page; // 🔑 page requested

  const safeData = data ?? [];

  if (page === 1) {
    state.sentList = safeData;
  } else {
    state.sentList = [...state.sentList, ...safeData];
  }

  state.sentMeta = meta;
  state.sentLoading = false;
})
      .addCase(fetchSentNotifications.rejected, (state) => {
        state.sentLoading = false;
      })

  },
});

export const { pushNotification, clearArchiveError, resetSentNotifications  } = notificationSlice.actions;
export default notificationSlice.reducer;
