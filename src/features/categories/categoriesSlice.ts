import { Category } from "@/types/data-models"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

interface CategoriesState {
  categories: Category[]
  selectedCategory: Category | null
}

const initialState: CategoriesState = {
  categories: [],
  selectedCategory: null,
}

export const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategories: (state: CategoriesState, action) => {
      state.categories = action.payload as Category[]
    }
  },
  extraReducers(builder) {
    builder.addAsyncThunk(fetchLocalCategories, {
      fulfilled: (state, action) => {
        state.categories = action.payload
      }
    })
  },
})

export const { setCategories } = categoriesSlice.actions

export default categoriesSlice.reducer

export const fetchLocalCategories = createAsyncThunk<Category[]>(
  'categories/fetch-local-categories',
  async () => {
    const categories: Category[] = await window.localDatabase.fetchCategories()
    return categories
  }
)