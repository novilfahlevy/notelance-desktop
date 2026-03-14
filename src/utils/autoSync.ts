// src/utils/autoSync.ts
import { toast } from 'react-toastify'
import { SyncResult } from '@/synchronization'

/**
 * Performs automatic synchronization in the background
 * Shows a subtle toast notification
 */
export const performAutoSync = async (): Promise<void> => {
  try {
    const result: SyncResult = await window.localDatabase.syncWithRemote()

    if (result.status === 'success') {
      // Silent success or minimal notification
      toast.info('Data tersinkronisasi', {
        position: 'bottom-right',
        autoClose: 2000,
        hideProgressBar: true,
        closeButton: false,
        style: {
          fontSize: '0.875rem',
        }
      })
    } else {
      // Show error but don't block the user
      toast.warn('Sinkronisasi gagal, akan dicoba lagi nanti', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: true,
      })
    }
  } catch (error) {
    console.error('Auto-sync error:', error)
    // Silent error - don't disturb the user
  }
}

/**
 * Debounced version of auto-sync
 * Prevents multiple syncs in quick succession
 */
let syncTimeout: NodeJS.Timeout | null = null

export const debouncedAutoSync = (delayMs = 1000): void => {
  if (syncTimeout) {
    clearTimeout(syncTimeout)
  }
  
  syncTimeout = setTimeout(() => {
    performAutoSync()
    syncTimeout = null
  }, delayMs)
}