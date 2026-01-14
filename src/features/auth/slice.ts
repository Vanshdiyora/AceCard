import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  loginRequest,
  forgotPasswordRequest,
  resetPasswordRequest,
} from "./services/auth.service";

/* -----------------------------------------------------
   Types
----------------------------------------------------- */

interface JwtPayload {
  role?: string;
  [key: string]: any;
}

interface AuthState {
  token: string | null;
  user: JwtPayload | null;
  role: string | null;
  loading: boolean;
  error: string | null;
}

/* -----------------------------------------------------
   Helpers
----------------------------------------------------- */

function decodeToken(token: string | null): { user: JwtPayload | null; role: string | null } {
  if (!token) return { user: null, role: null };

  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload) as JwtPayload;
    return { user: payload, role: payload.role || null };
  } catch {
    return { user: null, role: null };
  }
}

/* -----------------------------------------------------
   Initial State
----------------------------------------------------- */

const savedToken = localStorage.getItem("token");
const decoded = decodeToken(savedToken);

const initialState: AuthState = {
  token: savedToken,
  user: decoded.user,
  role: decoded.role,
  loading: false,
  error: null,
};

/* -----------------------------------------------------
   Thunks
----------------------------------------------------- */

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await loginRequest(payload);
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Login failed");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      return await forgotPasswordRequest(email);
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to send OTP");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    payload: { email: string; code: string; new_password: string },
    { rejectWithValue }
  ) => {
    try {
      return await resetPasswordRequest(payload.email, payload.code, payload.new_password);
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to reset password");
    }
  }
);

/* -----------------------------------------------------
   Slice
----------------------------------------------------- */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.role = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder

      /* Login */
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.token = null;
        state.user = null;
        state.role = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string }>) => {
        state.loading = false;
        const token = action.payload.token;
        state.token = token;
        localStorage.setItem("token", token);

        const decoded = decodeToken(token);
        state.user = decoded.user;
        state.role = decoded.role;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Invalid credentials";
      })

      /* Forgot Password */
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* Reset Password */
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
