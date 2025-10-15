// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import { Category } from './types/data-models'

contextBridge.exposeInMainWorld('localDatabase', {
  async fetchCategories(): Promise<Category[]> {
    return await ipcRenderer.invoke('fetch-categories')
  },
  async addCategory(categoryName: string): Promise<Category> {
    return await ipcRenderer.invoke('add-category', categoryName)
  },
  async updateCategory(categoryId: number, categoryName: string): Promise<Category> {
    return await ipcRenderer.invoke('update-category', categoryId, categoryName)
  },
  async deleteCategory(categoryId: number): Promise<void> {
    return await ipcRenderer.invoke('delete-category', categoryId)
  },
  async reorderCategories(categories: Category[]): Promise<void> {
    return await ipcRenderer.invoke('reorder-categories', categories)
  }
})