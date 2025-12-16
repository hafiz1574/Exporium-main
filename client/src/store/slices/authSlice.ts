import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api } from "../../api/http";
import type { User } from "../../types/models";

type AuthState = {
  token: string | null;
  user: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: AuthState = {
  token: localStorage.getItem("exporium_token"),
  user: null,
  status: "idle",
  error: null
};

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/auth/login", payload);
      return data as { token: string; user: User };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.error ?? "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/auth/register", payload);
      return data as { token: string; user: User };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.error ?? "Signup failed");
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
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("exporium_token", action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = String(action.payload ?? action.error.message ?? "Login failed");
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("exporium_token", action.payload.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = String(action.payload ?? action.error.message ?? "Signup failed");
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
