import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { setCookie, eraseCookie, getCookie } from "../../utils/cookieUtils";
import {
  loginRequest,
  forgotPasswordRequest,
  verifyCodeRequest,
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
  subdomain: string | null;
  resetToken: string | null;
  loading: boolean;
  error: string | null;
}

interface LoginResponse {
  token: string;
  subdomain?: string;
}

/* -----------------------------------------------------
   Helpers
----------------------------------------------------- */

function decodeToken(token: string | null): { user: JwtPayload | null; role: string | null; subdomain: string | null } {
  if (!token) return { user: null, role: null, subdomain: null };

  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload) as JwtPayload;
    return {
      user: payload,
      role: payload.role || null,
      subdomain: payload.subdomain || payload.tenant || null // Attempt to extract subdomain
    };
  } catch {
    return { user: null, role: null, subdomain: null };
  }
}

/* -----------------------------------------------------
   Initial State
----------------------------------------------------- */

const savedToken = getCookie("token");
const decoded = decodeToken(savedToken);

const initialState: AuthState = {
  token: savedToken,
  user: decoded.user,
  role: decoded.role,
  subdomain: decoded.subdomain,
  resetToken: null,
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
      return rejectWithValue(err?.response?.data?.message || "Failed to send code");
    }
  }
);

export const verifyCode = createAsyncThunk(
  "auth/verifyCode",
  async (payload: { email: string; code: string }, { rejectWithValue }) => {
    try {
      const res = await verifyCodeRequest(payload.email, payload.code);
      return res.data; // { reset_token }
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Invalid code");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (payload: { reset_token: string; new_password: string }, { rejectWithValue }) => {
    try {
      return await resetPasswordRequest(payload.reset_token, payload.new_password);
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
      state.resetToken = null;
      state.loading = false;
      state.error = null;
      eraseCookie("token");
    },
    setCredentials(state, action: PayloadAction<{ token: string; subdomain?: string }>) {
      state.token = action.payload.token;
      setCookie("token", action.payload.token);

      const decoded = decodeToken(action.payload.token);
      state.user = decoded.user;
      state.role = decoded.role;
      state.subdomain = action.payload.subdomain || decoded.subdomain || null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* Login */
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.subdomain = action.payload.subdomain || null;

        setCookie("token", action.payload.token);

        const decoded = decodeToken(action.payload.token);
        state.user = decoded.user;
        state.role = decoded.role;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* Forgot */
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

      /* Verify */
      .addCase(verifyCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyCode.fulfilled, (state, action: PayloadAction<{ reset_token: string }>) => {
        state.loading = false;
        state.resetToken = action.payload.reset_token;
      })
      .addCase(verifyCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* Reset */
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.resetToken = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
