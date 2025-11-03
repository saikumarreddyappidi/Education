import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { NotesState } from '../types/index';
import api from '../services/api';

const initialState: NotesState = {
  notes: [],
  searchResults: [], // Temporary search results for staff notes
  currentStaffInfo: null, // Info about currently searched staff
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedTags: [],
};

// Async thunks
export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🚀 Starting fetchNotes API call...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No token found in localStorage');
        throw new Error('No token found');
      }
      
      console.log('🔑 Token found:', token.substring(0, 20) + '...');
      console.log('🌐 Making API request to: /notes');
      
      const response = await api.get('/notes');
      console.log('✅ API response received:', response.data);
      console.log('📋 Notes from API:', response.data);
      console.log('📊 Notes count:', response.data?.length || 'undefined');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error in fetchNotes:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notes');
    }
  }
);

export const createNote = createAsyncThunk(
  'notes/createNote',
  async (noteData: { title: string; content: string; tags: string[]; isShared?: boolean }, { rejectWithValue }) => {
    try {
      console.log('📝 Creating note with data:', noteData);
      
      // Log the auth token for debugging
      const token = localStorage.getItem('token');
      console.log('🔑 Using token:', token ? `${token.substring(0, 15)}...` : 'No token found');
      
      // Make the API request
      const response = await api.post('/notes', noteData);
      console.log('✅ Note created, response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating note:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('❌ Error response data:', error.response.data);
        console.error('❌ Error response status:', error.response.status);
      } else if (error.request) {
        console.error('❌ No response received. Request details:', error.request);
      } else {
        console.error('❌ Error message:', error.message);
      }
      
      // Return a more informative error message
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to create note. Please check your connection and try again.'
      );
    }
  }
);

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ id, ...noteData }: { id: string; title: string; content: string; tags: string[]; isShared?: boolean }, { rejectWithValue }) => {
    try {
      console.log('📝 Updating note with ID:', id, 'and data:', noteData);
      
      // Log the auth token for debugging
      const token = localStorage.getItem('token');
      console.log('🔑 Using token:', token ? `${token.substring(0, 15)}...` : 'No token found');
      
      // Make the API request
      const response = await api.put(`/notes/${id}`, noteData);
      console.log('✅ Note updated, response:', response.data);
      return response.data.note || response.data;
    } catch (error: any) {
      console.error('❌ Error updating note:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('❌ Error response data:', error.response.data);
        console.error('❌ Error response status:', error.response.status);
      } else if (error.request) {
        console.error('❌ No response received. Request details:', error.request);
      } else {
        console.error('❌ Error message:', error.message);
      }
      
      // Return a more informative error message
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to update note. Please check your connection and try again.'
      );
    }
  }
);

export const searchStaffNotes = createAsyncThunk(
  'notes/searchStaffNotes',
  async (staffId: string, { rejectWithValue }) => {
    try {
      console.log('🔍 Searching for staff notes, staffId:', staffId);
      const response = await api.get(`/notes/search/${staffId}`);
      console.log('✅ Staff search response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Staff search error:', error);
      console.error('❌ Error response:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to search staff notes');
    }
  }
);

export const saveSearchedNote = createAsyncThunk(
  'notes/saveSearchedNote',
  async (noteId: string, { rejectWithValue }) => {
    try {
      console.log('💾 Saving searched note, noteId:', noteId);
      const response = await api.post(`/notes/save/${noteId}`);
      console.log('✅ Note saved response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Save note error:', error);
      console.error('❌ Error response:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to save note');
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('🗑️ Deleting note with ID:', id);
      
      // Log the auth token for debugging
      const token = localStorage.getItem('token');
      console.log('🔑 Using token for delete:', token ? `${token.substring(0, 15)}...` : 'No token found');
      
      const response = await api.delete(`/notes/${id}`);
      console.log('✅ Note deleted successfully, response:', response.data);
      return id;
    } catch (error: any) {
      console.error('❌ Error deleting note:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('❌ Error response data:', error.response.data);
        console.error('❌ Error response status:', error.response.status);
      } else if (error.request) {
        console.error('❌ No response received. Request details:', error.request);
      } else {
        console.error('❌ Error message:', error.message);
      }
      
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete note. Please check your connection and try again.'
      );
    }
  }
);

export const searchNotes = createAsyncThunk(
  'notes/searchNotes',
  async ({ query, tags }: { query: string; tags: string[] }, { rejectWithValue }) => {
    try {
      console.log('🔍 Searching notes with query:', query, 'and tags:', tags);
      
      const response = await api.get('/notes/search', {
        params: { q: query, tags: tags.join(',') }
      });
      
      console.log('✅ Search results:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error searching notes:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('❌ Error response data:', error.response.data);
        console.error('❌ Error response status:', error.response.status);
      } else if (error.request) {
        console.error('❌ No response received. Request details:', error.request);
      } else {
        console.error('❌ Error message:', error.message);
      }
      
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to search notes. Please check your connection and try again.'
      );
    }
  }
);

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedTags: (state, action) => {
      state.selectedTags = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.currentStaffInfo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notes
      .addCase(fetchNotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload;
        console.log('📋 Notes state updated in Redux:', action.payload);
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch notes';
        state.notes = []; // Ensure notes is always an array
        console.error('❌ fetchNotes rejected:', action.error.message);
      })
      // Create note
      .addCase(createNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
  state.isLoading = false;
  if (!Array.isArray(state.notes)) state.notes = [];
  state.notes.unshift(action.payload);
      })
      .addCase(createNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create note';
      })
      // Update note
      .addCase(updateNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.notes.findIndex((note: any) => note._id === action.payload._id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update note';
      })
      // Delete note
      .addCase(deleteNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = state.notes.filter((note: any) => note._id !== action.payload);
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete note';
      })
      // Search notes
      .addCase(searchNotes.fulfilled, (state, action) => {
        state.notes = action.payload;
      })
      .addCase(searchNotes.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to search notes';
        state.notes = []; // Ensure notes is always an array
      })
      // Search staff notes
      .addCase(searchStaffNotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchStaffNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.notes;
        state.currentStaffInfo = action.payload.teacherInfo;
      })
      .addCase(searchStaffNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to search notes';
        state.searchResults = [];
        state.currentStaffInfo = null;
      })
      // Save searched note
      .addCase(saveSearchedNote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveSearchedNote.fulfilled, (state, action) => {
  state.isLoading = false;
  if (!Array.isArray(state.notes)) state.notes = [];
  state.notes.unshift(action.payload); // Add to user's permanent notes at the beginning
      })
      .addCase(saveSearchedNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to save note';
      });
  },
});

export const { setSearchQuery, setSelectedTags, clearError, clearSearchResults } = notesSlice.actions;
export default notesSlice.reducer;
