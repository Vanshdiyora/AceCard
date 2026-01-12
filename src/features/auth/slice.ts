import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginRequest } from "./services/auth.service";

function decodeToken(token: string | null) {
  if (!token) return { user: null, role: null };

  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return { user: payload, role: payload.role };
  } catch {
    return { user: null, role: null };
  }
}


const savedToken = localStorage.getItem("token");
const decoded = decodeToken(savedToken);
interface AuthState {
  token: string | null;
  user: any | null;
  role: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: savedToken,
  user: decoded.user,
  role: decoded.role,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }) => {
    return await loginRequest(payload);
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.role = null;
      state.error = null;
      state.loading = false;
      localStorage.removeItem("token");
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.user = null;
        state.role = null;
        state.token = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        const token = action.payload.token;

        state.token = token;
        localStorage.setItem("token", token);

        const decoded = decodeToken(token);
        state.user = decoded.user;
        state.role = decoded.role;
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
        state.error = "Invalid credentials";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
