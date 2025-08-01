import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  token: null, 
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;

      if (action.payload.token) {
        state.token = action.payload.token;
        sessionStorage.setItem("token", action.payload.token);
      }
    },
    userLoggedOut: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      sessionStorage.removeItem("token");
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
