import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import notesReducer from './notesSlice';
import forumReducer from '../features/forum/forumSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notes: notesReducer,
    forum: forumReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
