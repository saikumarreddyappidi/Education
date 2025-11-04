// Simplified noteSlice for now
import { createSlice } from '@reduxjs/toolkit';

const noteSlice = createSlice({
  name: 'notes',
  initialState: { notes: [] },
  reducers: {},
});

export default noteSlice.reducer;
