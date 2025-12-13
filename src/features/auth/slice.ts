import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginRequest } from "./services/auth.service";

interface AuthState {
  token: string | null;
  user: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }) => {
    const data = await loginRequest(payload);
    return data;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        const token = action.payload.token;

        state.token = token;
        localStorage.setItem("token", token);

        // Decode JWT to get vendor_id, user_id, role
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          state.user = payload; // contains vendor_id, user_id, role
        } catch {
          state.user = null;
        }
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
        state.error = "Invalid credentials";
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
