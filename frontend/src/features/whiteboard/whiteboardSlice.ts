// Simplified whiteboardSlice for now
import { createSlice } from '@reduxjs/toolkit';

const whiteboardSlice = createSlice({
  name: 'whiteboards',
  initialState: { whiteboards: [] },
  reducers: {},
});

export default whiteboardSlice.reducer;
