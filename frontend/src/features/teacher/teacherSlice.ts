// Simplified teacherSlice for now
import { createSlice } from '@reduxjs/toolkit';

const teacherSlice = createSlice({
  name: 'teachers',
  initialState: { teachers: [] },
  reducers: {},
});

export default teacherSlice.reducer;
