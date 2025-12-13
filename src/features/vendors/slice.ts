import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { vendorsService } from "./services/vendors.service";
import type { VendorItem, VendorStat } from "./types";

interface VendorsState {
  vendors: VendorItem[];
  stats: VendorStat[];
  loading: boolean;
  error?: string;
}

const initialState: VendorsState = {
  vendors: [],
  stats: [],
  loading: false,
};

// ---------------------------------------------------
// 🔹 GET ALL VENDORS
// ---------------------------------------------------
export const fetchVendors = createAsyncThunk("vendors/fetchAll", async () => {
  return await vendorsService.list();
});

// ---------------------------------------------------
// 🔹 CREATE VENDOR
// ---------------------------------------------------
export const createVendor = createAsyncThunk(
  "vendors/create",
  async (data: any) => {
    return await vendorsService.create(data);
  }
);

// ---------------------------------------------------
// 🔹 UPDATE VENDOR INFO
// ---------------------------------------------------
export const updateVendor = createAsyncThunk(
  "vendors/update",
  async ({ id, data }: { id: number; data: any }) => {
    return await vendorsService.update(id, data);
  }
);

// ---------------------------------------------------
// 🔹 UPDATE SEATS
// ---------------------------------------------------
export const updateSeats = createAsyncThunk(
  "vendors/updateSeats",
  async ({ id, seats }: { id: number; seats: number }) => {
    return await vendorsService.updateSeats(id, seats);
  }
);

// ---------------------------------------------------
// 🔹 ARCHIVE VENDOR
// ---------------------------------------------------
export const archiveVendor = createAsyncThunk(
  "vendors/archive",
  async (id: number) => {
    await vendorsService.archive(id);
    return id; // return deleted vendor ID
  }
);

// ---------------------------------------------------
// 🔹 NOTIFY VENDOR
// ---------------------------------------------------
export const notifyVendor = createAsyncThunk(
  "vendors/notify",
  async (payload: any) => {
    return await vendorsService.notify(payload);
  }
);

// ---------------------------------------------------
// Helper: Recalculate Stats
// ---------------------------------------------------
function computeStats(vendors: VendorItem[]): VendorStat[] {
  const total = vendors.length;
  const active = vendors.filter((x) => x.status === "active").length;
  const pending = vendors.filter((x) => x.status === "pending").length;
  const archived = vendors.filter((x) => x.status === "archived").length;

  return [
    { title: "Total Vendors", value: total, icon: "users", positive: true },
    { title: "Pending Verification", value: pending, icon: "clock", positive: false },
    { title: "Active Vendors", value: active, icon: "check-circle", positive: true },
    { title: "Archived", value: archived, icon: "archive", positive: false },
  ];
}

// ---------------------------------------------------
// 🔥 SLICE
// ---------------------------------------------------
const vendorsSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ----------------------------
    // Fetch Vendors
    // ----------------------------
    builder.addCase(fetchVendors.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchVendors.fulfilled, (state, action) => {
      state.loading = false;
      state.vendors = action.payload;
      state.stats = computeStats(state.vendors);
    });

    builder.addCase(fetchVendors.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // ----------------------------
    // Create Vendor
    // ----------------------------
    builder.addCase(createVendor.fulfilled, (state, action) => {
      state.vendors.push(action.payload);
      state.stats = computeStats(state.vendors);
    });

    // ----------------------------
    // Update Vendor
    // ----------------------------
    builder.addCase(updateVendor.fulfilled, (state, action) => {
      const index = state.vendors.findIndex((v) => v.id === action.payload.id);
      if (index !== -1) {
        state.vendors[index] = action.payload;
      }
      state.stats = computeStats(state.vendors);
    });

    // ----------------------------
    // Update Seats
    // ----------------------------
    builder.addCase(updateSeats.fulfilled, (state, action) => {
      const index = state.vendors.findIndex((v) => v.id === action.payload.id);
      if (index !== -1) {
        state.vendors[index] = action.payload;
      }
      state.stats = computeStats(state.vendors);
    });

    // ----------------------------
    // Archive Vendor
    // ----------------------------
    builder.addCase(archiveVendor.fulfilled, (state, action) => {
      state.vendors = state.vendors.map((v) =>
        v.id === action.payload ? { ...v, status: "archived" } : v
      );

      state.stats = computeStats(state.vendors);
    });

    // ----------------------------
    // Notify Vendor (no UI change)
    // ----------------------------
    builder.addCase(notifyVendor.fulfilled, () => {
      // No state updates needed unless required
    });
  },
});

// ---------------------------------------------------
export default vendorsSlice.reducer;