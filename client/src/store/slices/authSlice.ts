import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api } from "../../api/http";
import type { User } from "../../types/models";

type AuthState = {
  token: string | null;
  user: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  pendingVerificationEmail: string | null;
};

const initialState: AuthState = {
  token: localStorage.getItem("exporium_token"),
  user: null,
  status: "idle",
  error: null,
  pendingVerificationEmail: null
};

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/auth/login", payload);
      return data as { token: string; user: User };
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.code === "EMAIL_NOT_VERIFIED") {
        return rejectWithValue({ message: data?.error ?? "Email not verified", code: data.code, email: data.email });
      }
      return rejectWithValue(data?.error ?? "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/auth/register", payload);
      return data as { message: string; email: string };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.error ?? "Signup failed");
    }
  }
);

export const resendVerification = createAsyncThunk(
  "auth/resendVerification",
  async (payload: { email: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/auth/resend-verification", payload);
      return data as { message: string };
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.error ?? err?.message ?? "Failed to resend verification email"
      );
    }
  }
);

export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/api/auth/me");
    return data as { user: User };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.error ?? "Failed to load user");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("exporium_token");
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.pendingVerificationEmail = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("exporium_token", action.payload.token);
        state.pendingVerificationEmail = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        const payload: any = action.payload;
        state.error = String(
          (typeof payload === "string" ? payload : payload?.message) ??
            action.error.message ??
            "Login failed"
        );
        state.pendingVerificationEmail =
          payload && typeof payload === "object" && payload?.code === "EMAIL_NOT_VERIFIED" ? payload.email : null;
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.status = "succeeded";
        // Policy (A): registration does not log in until email is verified.
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = String(action.payload ?? action.error.message ?? "Signup failed");
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(resendVerification.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.status = "failed";
        state.error = String(action.payload ?? action.error.message ?? "Failed to resend verification email");
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
