// Simplified fileSlice for now
import { createSlice } from '@reduxjs/toolkit';

const fileSlice = createSlice({
  name: 'files',
  initialState: { files: [] },
  reducers: {},
});

export default fileSlice.reducer;
