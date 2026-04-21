import { configureStore } from '@reduxjs/toolkit';
import adminReducer from '../features/adminSlice';
import authReducer from '../features/authSlice';
import marketReducer from '../features/marketSlice';
import notificationsReducer from '../features/notificationsSlice';
import portfolioReducer from '../features/portfolioSlice';

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    auth: authReducer,
    market: marketReducer,
    notifications: notificationsReducer,
    portfolio: portfolioReducer,
  },
});

export default store;