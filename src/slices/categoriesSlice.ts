import { RootState } from '@/app/store'
import { Category } from '@/types/data-models'
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'

interface CategoriesState {
  selectedCategory: Category | null
  categories: Category[]
  generalNotesCount: number
  isLoading: boolean
  error: string | null
}

const initialState: CategoriesState = {
  selectedCategory: null,
  categories: [],
  generalNotesCount: 0,
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    return await window.localDatabase.fetchCategories()
  }
)

export const fetchGeneralNotesCount = createAsyncThunk(
  'categories/fetchGeneralNotesCount',
  async () => {
    return await window.localDatabase.fetchGeneralNotesCount()
  }
)

export const addCategory = createAsyncThunk(
  'categories/addCategory',
  async (categoryName: string) => {
    return await window.localDatabase.addCategory(categoryName)
  }
)

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ categoryId, categoryName }: { categoryId: number; categoryName: string }) => {
    return await window.localDatabase.updateCategory(categoryId, categoryName)
  }
)

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (categoryId: number) => {
    await window.localDatabase.deleteCategory(categoryId)
    return categoryId
  }
)

export const reorderCategories = createAsyncThunk(
  'categories/reorderCategories',
  async (categories: Category[]) => {
    await window.localDatabase.reorderCategories(categories)
    return categories
  }
)

export const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setSelectedCategory: (state: CategoriesState, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload
    },
    updateCategoriesOrder: (state: CategoriesState, action: PayloadAction<Category[]>) => {
      state.categories = action.payload
    },
    increaseGeneralNoteCount: (state: CategoriesState) => {
      state.generalNotesCount++
    },
    decreaseGeneralNoteCount: (state: CategoriesState) => {
      state.generalNotesCount--
    },
    increaseCategoryNoteCount: (state: CategoriesState, action: PayloadAction<number>) => {
      const categoryIndex = state.categories.findIndex((category: Category) => category.id == action.payload)
      state.categories[categoryIndex].notes_count++
    },
    decreaseCategoryNoteCount: (state: CategoriesState, action: PayloadAction<number>) => {
      const categoryIndex = state.categories.findIndex((category: Category) => category.id == action.payload)
      state.categories[categoryIndex].notes_count--
    },
    clearError: (state: CategoriesState) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch categories
    builder.addCase(fetchCategories.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.isLoading = false
      state.categories = action.payload
    })
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message || 'Failed to fetch categories'
    })

    // Fetch general notes count
    builder.addCase(fetchGeneralNotesCount.fulfilled, (state, action) => {
      state.generalNotesCount = action.payload
    })

    // Add category
    builder.addCase(addCategory.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(addCategory.fulfilled, (state, action) => {
      state.isLoading = false
      state.categories.push(action.payload)
    })
    builder.addCase(addCategory.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message || 'Failed to add category'
    })

    // Update category
    builder.addCase(updateCategory.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(updateCategory.fulfilled, (state, action) => {
      state.isLoading = false
      const index = state.categories.findIndex(cat => cat.id === action.payload.id)
      if (index !== -1) {
        state.categories[index] = action.payload
      }
      if (state.selectedCategory?.id === action.payload.id) {
        state.selectedCategory = action.payload
      }
    })
    builder.addCase(updateCategory.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message || 'Failed to update category'
    })

    // Delete category
    builder.addCase(deleteCategory.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.isLoading = false
      state.categories = state.categories.filter(cat => cat.id !== action.payload)
      if (state.selectedCategory?.id === action.payload) {
        state.selectedCategory = null
      }
    })
    builder.addCase(deleteCategory.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message || 'Failed to delete category'
    })

    // Reorder categories
    builder.addCase(reorderCategories.pending, (state) => {
      state.error = null
    })
    builder.addCase(reorderCategories.fulfilled, (state) => {
      // Categories already updated via updateCategoriesOrder reducer
    })
    builder.addCase(reorderCategories.rejected, (state, action) => {
      state.error = action.error.message || 'Failed to reorder categories'
    })
  },
})

// Selectors
export const selectSelectedCategory = (state: RootState) => state.categories.selectedCategory
export const selectCategories = (state: RootState) => state.categories.categories
export const selectGeneralNotesCount = (state: RootState) => state.categories.generalNotesCount
export const selectIsLoading = (state: RootState) => state.categories.isLoading
export const selectError = (state: RootState) => state.categories.error

export const {
  setSelectedCategory,
  increaseGeneralNoteCount,
  decreaseGeneralNoteCount,
  increaseCategoryNoteCount,
  decreaseCategoryNoteCount,
  updateCategoriesOrder,
  clearError
} = categoriesSlice.actions

export default categoriesSlice.reducer