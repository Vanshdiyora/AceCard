import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { vendorsService } from "./services/vendors.service";
import type { VendorItem, VendorStat, VendorMeta } from "./types";
import type { VendorTeamActivity, VendorTeamMeta } from "./types";
import type { VendorTeamResponse, SearchVendorTeamParams } from "./types";

/* ---------- STATE ---------- */
interface VendorsState {
  vendors: VendorItem[];
  meta: VendorMeta | null;
  stats: VendorStat[];
 searchResults: VendorItem[];
  searchMeta: VendorMeta | null;
  searchLoading: boolean;
  

  loading: boolean;
  seatsUpdating: boolean; // 👈 add
  error?: string;
  teamActivity: VendorTeamActivity[];
  teamMeta: VendorTeamMeta | null;
  teamLoading: boolean;
}


const initialState: VendorsState = {
  vendors: [],
  meta: null,
  stats: [],
  loading: false,
  seatsUpdating: false,

  searchResults: [],
  searchMeta: null,
  searchLoading: false,


  teamActivity: [],
  teamMeta: null,
  teamLoading: false,
};



/* ---------- THUNKS ---------- */

export type FetchVendorsParams = {
  page?: number;
  page_size?: number;
  legal_name?: string; // ✅ add
  status?: "active" | "archived";
  append?: boolean;
};


type ApiError = { response?: { data?: { error?: string; message?: string } } };

function extractError(err: unknown, fallback: string): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err && "response" in err) {
    const e = err as ApiError;
    return e.response?.data?.error || e.response?.data?.message || fallback;
  }
  return fallback;
}

export const fetchVendors = createAsyncThunk<
  { data: VendorItem[]; meta: VendorMeta },
  FetchVendorsParams | undefined,
  { rejectValue: string }
>(
  "vendors/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      return await vendorsService.list(params ?? { page: 1, page_size: 10 });
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "Failed to fetch vendors"));
    }
  }
);

export const searchVendors = createAsyncThunk<
  { data: VendorItem[]; meta: VendorMeta },
  FetchVendorsParams,
  { rejectValue: string }
>("vendors/search", async (params, { rejectWithValue }) => {
  try {
    const { legal_name, status, ...pagination } = params;
    return await vendorsService.search(pagination, { legal_name, status });
  } catch (err: unknown) {
    return rejectWithValue(extractError(err, "Failed to search vendors"));
  }
});

export const searchVendorTeam = createAsyncThunk<
  VendorTeamResponse,
  { vendorId: number; params: SearchVendorTeamParams },
  { rejectValue: string }
>(
  "vendors/searchTeam",
  async ({ vendorId, params }, { rejectWithValue }) => {
    try {
      return await vendorsService.teamSearch(vendorId, params);
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "Failed to fetch team activity"));
    }
  }
);

export const unarchiveVendor = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "vendors/unarchive",
  async (id, { rejectWithValue }) => {
    try {
      await vendorsService.unarchive(id);
      return id;
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "Failed to unarchive vendor"));
    }
  }
);

export const createVendor = createAsyncThunk<
  VendorItem,
  Partial<VendorItem>,
  { rejectValue: string }
>(
  "vendors/create",
  async (data, { rejectWithValue }) => {
    try {
      return await vendorsService.create(data);
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "Failed to create vendor"));
    }
  }
);

export const updateVendor = createAsyncThunk<
  VendorItem,
  { id: number; data: Partial<VendorItem> },
  { rejectValue: string }
>(
  "vendors/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await vendorsService.update(id, data);
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "Failed to update vendor"));
    }
  }
);

export const updateSeats = createAsyncThunk<
  { id: number; seats: number },
  { id: number; seats: number },
  { rejectValue: string }
>(
  "vendors/updateSeats",
  async ({ id, seats }, { rejectWithValue }) => {
    try {
      await vendorsService.updateSeats(id, seats);
      return { id, seats }; // 👈 manually return
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "Failed to update seats"));
    }
  }
);


export const archiveVendor = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "vendors/archive",
  async (id, { rejectWithValue }) => {
    try {
      await vendorsService.archive(id);
      return id;
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "Failed to archive vendor"));
    }
  }
);

export const notifyVendor = createAsyncThunk<
  unknown,
  unknown,
  { rejectValue: string }
>(
  "vendors/notify",
  async (payload, { rejectWithValue }) => {
    try {
      return await vendorsService.notify(payload);
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "Failed to notify vendor"));
    }
  }
);

export const fetchVendorById = createAsyncThunk<
  VendorItem,
  number,
  { rejectValue: string }
>(
  "vendors/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await vendorsService.getById(id);
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, "Failed to fetch vendor"));
    }
  }
);

/* ---------- HELPERS ---------- */

function computeStats(vendors: VendorItem[]): VendorStat[] {
  const total = vendors.length;
  const active = vendors.filter((v) => v.status === "active").length;
  const archived = vendors.filter((v) => v.status === "archived").length;

  return [
    { title: "Total Vendors", value: total, icon: "users", positive: true },
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

      /* FETCH ALL */
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;

        const incoming = action.payload.data ?? [];
        const { append } = action.meta.arg || {};

        const map = new Map<number, VendorItem>();

        if (append) {
          state.vendors.forEach(v => map.set(v.id, v));
        }

        incoming.forEach(v => map.set(v.id, v));

        state.vendors = Array.from(map.values());
        state.meta = action.payload.meta ?? null;
        state.stats = computeStats(state.vendors);
      })


      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* UNARCHIVE */
      .addCase(unarchiveVendor.fulfilled, (state, action) => {
        const id = action.payload;
        const vendor = state.vendors.find((v) => v.id === id);
        if (vendor) vendor.status = "active";
        state.stats = computeStats(state.vendors);
      })

      /* CREATE */
      .addCase(createVendor.fulfilled, (state, action) => {
        state.vendors.unshift(action.payload);
        state.stats = computeStats(state.vendors);
      })

      /* FETCH BY ID */
      .addCase(fetchVendorById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVendorById.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.vendors.findIndex((v) => v.id === action.payload.id);
        if (idx !== -1) state.vendors[idx] = action.payload;
        else state.vendors.push(action.payload);
        state.stats = computeStats(state.vendors);
      })
      .addCase(fetchVendorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* UPDATE */
      .addCase(updateVendor.fulfilled, (state, action) => {
        const idx = state.vendors.findIndex((v) => v.id === action.payload.id);
        if (idx !== -1) state.vendors[idx] = action.payload;
        state.stats = computeStats(state.vendors);
      })

      /* UPDATE SEATS */
      .addCase(updateSeats.pending, (state, action) => {
        const { id, seats } = action.meta.arg;

        state.seatsUpdating = true;
        const vendor = state.vendors.find(v => v.id === id);
        if (vendor) {
          vendor.seats_appointed = seats; // ⚡ instant UI update
        }
      })

      .addCase(updateSeats.fulfilled, (state) => {
        // nothing else needed — state already updated
        state.stats = computeStats(state.vendors);
        state.seatsUpdating = false;
      })

      .addCase(updateSeats.rejected, (state, action) => {
        state.seatsUpdating = false;
        state.error = action.payload;
      })

      /* ARCHIVE */
      .addCase(archiveVendor.fulfilled, (state, action) => {
        state.vendors = state.vendors.map((v) =>
          v.id === action.payload ? { ...v, status: "archived" } : v
        );
        state.stats = computeStats(state.vendors);
      })

      /* TEAM SEARCH */
      .addCase(searchVendorTeam.pending, (state, action) => {
        state.teamLoading = true;
        state.error = undefined;

        // 🔹 If new vendor or new search, reset list
        const { append } = action.meta.arg.params || {};
        if (!append) {
          state.teamActivity = [];
          state.teamMeta = null;
        }
      })

      .addCase(searchVendorTeam.fulfilled, (state, action) => {
        state.teamLoading = false;

        const incoming = action.payload.data ?? [];
        const { append } = action.meta.arg.params || {};

        // 🔹 De-duplicate by id
        const map = new Map<number, VendorTeamActivity>();

        if (append) {
          state.teamActivity.forEach(t => map.set(t.id, t));
        }

        incoming.forEach(t => map.set(t.id, t));

        state.teamActivity = Array.from(map.values());
        state.teamMeta = action.payload.meta;
      })

      .addCase(searchVendorTeam.rejected, (state, action) => {
        state.teamLoading = false;
        state.error = action.payload;
      })
      /* SEARCH VENDORS */
     .addCase(searchVendors.pending, (state) => {
        state.searchLoading = true;
        state.error = undefined;
      })
      .addCase(searchVendors.fulfilled, (state, action) => {
        state.searchLoading = false;

        const incoming = action.payload.data ?? [];
        const { append } = action.meta.arg || {};

        const map = new Map<number, VendorItem>();

        if (append) {
          state.searchResults.forEach(v => map.set(v.id, v));
        }

        incoming.forEach(v => map.set(v.id, v));

        state.searchResults = Array.from(map.values());
        state.searchMeta = action.payload.meta;
      })
      .addCase(searchVendors.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      });


  },
});

export default vendorsSlice.reducer;
