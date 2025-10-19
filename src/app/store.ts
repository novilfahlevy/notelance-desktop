import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit'
import categoriesReducer from '@/slices/categoriesSlice'
import notesReducer from '@/slices/notesSlice'

export const store = configureStore({
  reducer: {
    categories: categoriesReducer,
    notes: notesReducer
  }
})

// Infer the type of `store`
export type AppStore = typeof store
export type RootState = ReturnType<AppStore['getState']>

// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore['dispatch']

// Define a reusable type describing thunk functions
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>