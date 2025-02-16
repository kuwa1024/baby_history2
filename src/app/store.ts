import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import storage from 'redux-persist/es/storage';
import LoadingReducer from '@/components/loading/loadingSlice';
import notificationReducer from '@/components/notification/notificationSlice';
import authReducer from '@/features/auth/authSlice';
import historyParamReducer from '@/features/history/historyParamSlice';
import { historySlice } from '@/features/history/historySlice';

const persistConfig = {
  key: 'root',
  version: 1,
  whitelist: ['auth'],
  storage,
};

const rootReducer = combineReducers({
  auth: authReducer,
  historyParam: historyParamReducer,
  loading: LoadingReducer,
  notification: notificationReducer,
  [historySlice.reducerPath]: historySlice.reducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(historySlice.middleware),
});

export const persistor = persistStore(store);

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
