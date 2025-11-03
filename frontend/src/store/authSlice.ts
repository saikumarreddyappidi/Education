import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState } from '../types/index';
import api from '../services/api';

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData: {
    registrationNumber: string;
    password: string;
    role: 'student' | 'staff';
    year?: string;
    semester?: string;
    course?: string;
    teacherCode?: string;
    subject?: string;
  }, { rejectWithValue }) => {
    try {
      console.log('🚀 Attempting registration with data:', {
        ...userData,
        password: '[REDACTED]' // Don't log passwords
      });
      
      const response = await api.post('/auth/register', userData);
      console.log('✅ Registration successful:', response.data);
      
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration API error:', error);
      
      // Handle network errors (when axios couldn't make the request)
      if (!error.response) {
        console.error('Network error during registration:', error.message);
        return rejectWithValue({ 
          message: 'Network error. Please check your connection and try again.',
          isNetworkError: true
        });
      }
      
      // Handle server errors with response
      if (error.response?.data) {
        console.error('Server returned error:', error.response.data);
        return rejectWithValue(error.response.data);
      }
      
      // Fallback for any other errors
      return rejectWithValue({ 
        message: error.message || 'Registration failed. Please try again.' 
      });
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { registrationNumber: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      if (error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'Network error. Please check your connection.' });
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as any;
        state.error = payload?.message || action.error.message || 'Registration failed';
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as any;
        state.error = payload?.message || action.error.message || 'Login failed';
      })
      // Get current user
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
