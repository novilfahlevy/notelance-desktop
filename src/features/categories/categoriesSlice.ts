import { RootState } from "@/app/store"
import { Category } from "@/types/data-models"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface CategoriesState {
  selectedCategory: Category | null
}

const initialState: CategoriesState = {
  selectedCategory: null,
}

export const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setSelectedCategory: (state: CategoriesState, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload
    }
  },
})

export const selectSelectedCategory = (state: RootState) => state.categories.selectedCategory

export const { setSelectedCategory } = categoriesSlice.actions

export default categoriesSlice.reducer