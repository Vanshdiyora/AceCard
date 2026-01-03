import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { vendorsService } from "./services/vendors.service";
import type {
  VendorItem,
  VendorStat,
  VendorMeta,
} from "./types";

/* ---------- STATE ---------- */
interface VendorsState {
  vendors: VendorItem[];
  meta: VendorMeta | null;
  stats: VendorStat[];
  loading: boolean;
  error?: string;
}

const initialState: VendorsState = {
  vendors: [],
  meta: null,
  stats: [],
  loading: false,
};

/* ---------- THUNKS ---------- */

export const fetchVendors = createAsyncThunk(
  "vendors/fetchAll",
  async (
    params: { page?: number; page_size?: number } | undefined,
    { rejectWithValue }
  ) => {
    try {
      return await vendorsService.list(
        params ?? { page: 1, page_size: 1 }
      );
    } catch (err: any) {
      return rejectWithValue(
        err?.message ?? "Failed to fetch vendors"
      );
    }
  }
);

export const createVendor = createAsyncThunk(
  "vendors/create",
  async (data: Partial<VendorItem>, { rejectWithValue }) => {
    try {
      return await vendorsService.create(data);
    } catch (err: any) {
      return rejectWithValue(
        err?.message ?? "Failed to create vendor"
      );
    }
  }
);

export const updateVendor = createAsyncThunk(
  "vendors/update",
  async (
    { id, data }: { id: number; data: Partial<VendorItem> },
    { rejectWithValue }
  ) => {
    try {
      return await vendorsService.update(id, data);
    } catch (err: any) {
      return rejectWithValue(
        err?.message ?? "Failed to update vendor"
      );
    }
  }
);

export const updateSeats = createAsyncThunk(
  "vendors/updateSeats",
  async (
    { id, seats }: { id: number; seats: number },
    { rejectWithValue }
  ) => {
    try {
      return await vendorsService.updateSeats(id, seats);
    } catch (err: any) {
      return rejectWithValue(
        err?.message ?? "Failed to update seats"
      );
    }
  }
);

export const archiveVendor = createAsyncThunk(
  "vendors/archive",
  async (id: number, { rejectWithValue }) => {
    try {
      await vendorsService.archive(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err?.message ?? "Failed to archive vendor"
      );
    }
  }
);

export const notifyVendor = createAsyncThunk(
  "vendors/notify",
  async (payload: any, { rejectWithValue }) => {
    try {
      return await vendorsService.notify(payload);
    } catch (err: any) {
      return rejectWithValue(
        err?.message ?? "Failed to notify vendor"
      );
    }
  }
);

/* ---------- HELPERS ---------- */

function computeStats(vendors: VendorItem[]): VendorStat[] {
  const total = vendors.length;
  const active = vendors.filter((v) => v.status === "active").length;
  const pending = vendors.filter((v) => v.status === "pending").length;
  const archived = vendors.filter((v) => v.status === "archived").length;

  return [
    { title: "Total Vendors", value: total, icon: "users", positive: true },
    { title: "Pending Verification", value: pending, icon: "clock", positive: false },
    { title: "Active Vendors", value: active, icon: "check-circle", positive: true },
    { title: "Archived", value: archived, icon: "archive", positive: false },
  ];
}

/* ---------- SLICE ---------- */

const vendorsSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* FETCH VENDORS */
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload.data ?? [];
        state.meta = action.payload.meta ?? null;
        state.stats = computeStats(state.vendors);
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.vendors = [];
        state.meta = null;
        state.stats = [];
      })

      /* CREATE */
      .addCase(createVendor.fulfilled, (state, action) => {
        state.vendors.unshift(action.payload);
        state.stats = computeStats(state.vendors);
      })

      /* UPDATE */
      .addCase(updateVendor.fulfilled, (state, action) => {
        const idx = state.vendors.findIndex(
          (v) => v.id === action.payload.id
        );
        if (idx !== -1) {
          state.vendors[idx] = action.payload;
        }
        state.stats = computeStats(state.vendors);
      })

      /* UPDATE SEATS */
      .addCase(updateSeats.fulfilled, (state, action) => {
        const idx = state.vendors.findIndex(
          (v) => v.id === action.payload.id
        );
        if (idx !== -1) {
          state.vendors[idx] = action.payload;
        }
        state.stats = computeStats(state.vendors);
      })

      /* ARCHIVE */
      .addCase(archiveVendor.fulfilled, (state, action) => {
        state.vendors = state.vendors.map((v) =>
          v.id === action.payload
            ? { ...v, status: "archived" }
            : v
        );
        state.stats = computeStats(state.vendors);
      });
  },
});

export default vendorsSlice.reducer;
