// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import { Category } from './types/data-models'

contextBridge.exposeInMainWorld('localDatabase', {
  async fetchCategories(): Promise<Category[]> {
    return await ipcRenderer.invoke('fetch-categories')
  }
})