// reduxSlices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { post } from '../api/api'; // Your API function

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await post('auth/login', credentials);
      if (response.status === 'true') {
        // ✅ Store token in localStorage as well
        localStorage.setItem('token', response.token);
        localStorage.setItem('adminId', response.adminId);
        localStorage.setItem('loginRole', response.role);
        return response; // Return full response
      } else {
        return rejectWithValue(response.msg || 'Login failed');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserRights = createAsyncThunk(
  'auth/fetchUserRights',
  async (adminId, { rejectWithValue }) => {
    try {
      const response = await get(`userRights/${adminId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,           // Full user data
    token: null,          // Auth token
    adminId: null,        // Admin ID
    isAuthenticated: false,
    loginLoading: false,
    loginError: null,
    userRights: [],       // User permissions
    systemRights: {}      // System rights from login response
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.adminId = null;
      state.isAuthenticated = false;
      state.userRights = [];
      state.systemRights = {};
      localStorage.removeItem('token');
      localStorage.removeItem('adminId');
      localStorage.removeItem('loginRole');
    }
  },
  extraReducers: (builder) => {
    builder
      // Login pending
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
      })
      // Login fulfilled ✅
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.adminId = action.payload.adminId;
        
        // ✅ Store complete user data
        state.user = {
          id: action.payload.adminId,
          email: action.payload.Email,
          name: action.payload.Name,
          role: action.payload.role,
          refId: action.payload.login?.refId,      // Important for API calls
          refType: action.payload.login?.refType,
          ...action.payload.login                   // Spread all login object data
        };
        
        // ✅ Store system rights
        state.systemRights = action.payload.systemRight || {};
        
        // ✅ Store in localStorage as backup
        localStorage.setItem('refId', action.payload.login?.refId);
        localStorage.setItem('userEmail', action.payload.Email);
        localStorage.setItem('userName', action.payload.Name);
        localStorage.setItem('userRole', action.payload.role);
      })
      // Login rejected
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginError = action.payload || 'Login failed';
        state.isAuthenticated = false;
      })
      // Fetch user rights
      .addCase(fetchUserRights.fulfilled, (state, action) => {
        state.userRights = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;