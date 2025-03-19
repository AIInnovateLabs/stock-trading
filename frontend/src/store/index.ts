import { configureStore } from '@reduxjs/toolkit'
import stockReducer from './slices/stockSlice'

export const store = configureStore({
  reducer: {
    stock: stockReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 