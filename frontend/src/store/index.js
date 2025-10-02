import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import wasteReducer from './slices/wasteSlice';
import messageReducer from './slices/messageSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    waste: wasteReducer,
    messages: messageReducer,
    notifications: notificationReducer,
  },
});