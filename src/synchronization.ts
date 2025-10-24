import httpClient from './httpClient'
import { CategoryLocalRepository } from './repositories/categoryLocalRepository'
import { NoteLocalRepository } from './repositories/noteLocalRepository'
import type { Category, Note } from './types/data-models'

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

export interface SyncResult {
  status: SyncStatus
  categoriesSync?: string
  notesSync?: string
  error?: string
  timestamp: string
}

// Response Types
interface CategoriesSyncResponse {
  state: string
  categories: any[]
  errorMessage?: string
}

interface RemoteCategoryIdIsNotFoundResponse {
  state: string
  message?: string
  client_id: number
  remote_id?: number
}

interface RemoteCategoryIsNewerResponse {
  state: string
  message?: string
  client_id: number
  remote_id?: number
  name: string
  order_index: number
  is_deleted: number
  updated_at: string
  created_at: string
}

interface RemoteCategoryIsDeprecatedResponse {
  state: string
  client_id: number
  remote_id: number
  message?: string
}

interface RemoteCategoryIdIsNotValidResponse {
  state: string
  client_id: number
  remote_id: number
}

interface ErrorIsOccurredCategoryResponse {
  state: string
  errorMessage: string
  client_id: number
  remote_id: number
}

interface RemoteNoteIdIsNotProvidedResponse {
  state: string
  message?: string
  client_id: number
  remote_id?: number
}

interface RemoteNoteIsNewerResponse {
  state: string
  message?: string
  client_id: number
  remote_id: number
  title: string
  content: string
  category_id?: number
  is_deleted: number
  updated_at: string
  created_at: string
}

interface RemoteNoteIsDeprecatedResponse {
  state: string
  message?: string
  client_id: number
  remote_id: number
}

interface RemoteNoteIdIsNotValidResponse {
  state: string
  client_id: number
  remote_id: number
}

interface ErrorIsOccurredNoteResponse {
  state: string
  errorMessage: string
  client_id: number
  remote_id: number
}

interface NoteIsNotFoundInRemoteResponse {
  state: string
  client_id: number
  remote_id: number
  title: string
}

interface NotesHaveSameTimesResponse {
  state: string
  client_id: number
  remote_id: number
}

interface NotesResponseSucceed {
  state: string
  notes: unknown[]
}

interface FetchNoteResponse {
  remote_id: number
  title: string
  content: string
  is_deleted: number
  created_at: string
  updated_at: string
  remote_category_id?: number
  remote_category_name?: string
  remote_category_order_index?: number
}

export class Synchronization {
  private static categoryLocalRepository = new CategoryLocalRepository()
  private static noteLocalRepository = new NoteLocalRepository()

  private static async synchronizeLocalCategoriesWithRemote(): Promise<void> {
    try {
      // Get all local categories
      const localCategories = await this.categoryLocalRepository.getWithTrashed()

      // Prepare categories data for sync endpoint
      const categoriesPayload = localCategories.map((category) => ({
        client_id: category.id,
        remote_id: category.remote_id,
        name: category.name,
        order_index: category.order_index,
        is_deleted: category.is_deleted ?? 0,
        created_at: category.created_at,
        updated_at: category.updated_at,
      }))

      // Make sync request
      const response = await httpClient.post<CategoriesSyncResponse>(
        '/categories/sync',
        { categories: categoriesPayload }
      )

      const syncResponse = response.data

      if (syncResponse.state === 'CATEGORIES_HAVE_SYNCED') {
        const categoryResponses = syncResponse.categories

        for (const categoryResponse of categoryResponses) {
          const responseData = categoryResponse as Record<string, unknown>
          const localCategoryId = responseData['client_id'] as number
          const localCategory = localCategories.find((cat) => cat.id === localCategoryId)

          if (!localCategory) {
            throw new Error('Local category not found')
          }

          await this.handleCategoryResponse(localCategory, responseData)
        }
      } else if (syncResponse.state === 'CATEGORIES_SYNC_IS_FAILED') {
        throw new Error(`Local categories sync failed: ${syncResponse.errorMessage}`)
      } else {
        throw new Error(`Unexpected response state: ${syncResponse.state}`)
      }
    } catch (error) {
      console.error('Exception synchronizing local categories:', error)
      throw error
    }
  }

  private static async handleCategoryResponse(
    localCategory: Category,
    responseData: Record<string, any>
  ): Promise<void> {
    try {
      switch (responseData['state']) {
      case 'CATEGORY_ID_IS_NOT_PROVIDED': {
        // Category was created on remote, update local with remote_id
        const categoryResponse = responseData as RemoteCategoryIdIsNotFoundResponse
        if (categoryResponse.remote_id != null) {
          await this.categoryLocalRepository.update(localCategory.id, {
            remoteId: categoryResponse.remote_id,
          })
          console.log(
            `Updated local category ${localCategory.name} with remote_id: ${categoryResponse.remote_id}`
          )
        } else {
          console.error(
            `Failed to create category ${localCategory.name} on remote: ${categoryResponse.message}`
          )
        }
        break
      }

      case 'CATEGORY_IN_THE_REMOTE_IS_NEWER': {
        // Update local category with remote data
        const categoryResponse = responseData as RemoteCategoryIsNewerResponse
        await this.categoryLocalRepository.update(localCategory.id, {
          name: categoryResponse.name,
          orderIndex: categoryResponse.order_index,
          isDeleted: categoryResponse.is_deleted,
          updatedAt: categoryResponse.updated_at,
        })
        console.log(`Updated local category ${localCategory.name} with newer remote data`)
        break
      }

      case 'CATEGORY_IN_THE_REMOTE_IS_DEPRECATED': {
        const categoryResponse = responseData as RemoteCategoryIsDeprecatedResponse
        if (categoryResponse.message?.includes('updated')) {
          console.log(`Successfully updated remote category for ${localCategory.name}`)
        } else {
          console.error(`Failed to update remote category for ${localCategory.name}`)
        }
        break
      }

      case 'CATEGORY_ID_IS_NOT_VALID': {
        const categoryResponse = responseData as RemoteCategoryIdIsNotValidResponse
        console.error(
          `Invalid remote_id for category ${localCategory.name}: ${categoryResponse.remote_id}`
        )
        break
      }

      case 'AN_ERROR_OCCURED_IN_THIS_CATEGORY': {
        const categoryResponse = responseData as ErrorIsOccurredCategoryResponse
        console.error(
          `Error occurred for category ${localCategory.name}: ${categoryResponse.errorMessage}`
        )
        break
      }

      case 'CATEGORY_IS_NOT_FOUND_IN_THE_REMOTE': {
        console.log(
          `Category ${localCategory.name} is not found on remote, it may have been deleted remotely.`
        )
        break
      }

      case 'CATEGORY_IN_THE_REMOTE_IS_THE_SAME': {
        console.log(`Category ${localCategory.name} is in sync`)
        break
      }

      default: {
        console.warn(
          `Unknown sync state for category ${localCategory.name}: ${responseData['state']}`
        )
      }
      }
    } catch (error) {
      console.error(
        `Failed handling remote categories response for ${localCategory.name}:`,
        error
      )
    }
  }

  private static async fetchNewCategoriesFromRemote(): Promise<void> {
    try {
      const response = await httpClient.get('/categories')

      if (response.data.message === 'CATEGORIES_IS_FETCHED_SUCCESSFULLY') {
        const remoteCategories = response.data.categories as any[]

        for (const remoteCategoryData of remoteCategories) {
          const remoteId = remoteCategoryData['remote_id'] as number
          const existingCategory = await this.categoryLocalRepository.getByRemoteId(remoteId)

          if (!existingCategory) {
            // Create new category locally
            await this.categoryLocalRepository.create({
              name: remoteCategoryData['name'],
              orderIndex: remoteCategoryData['order_index'],
              remoteId: remoteId,
            })
            console.log(`Created new local category from remote: ${remoteCategoryData['name']}`)
          }
        }
      }
    } catch (error) {
      console.error('Failed fetching new categories from remote:', error)
      // Don't rethrow here as this is a supplementary operation
    }
  }

  private static async synchronizeLocalNotesWithRemote(): Promise<void> {
    try {
      // Get all local notes that need syncing (both deleted and active)
      const localNotes = await this.noteLocalRepository.getWithTrashed()

      // Prepare notes data for sync endpoint
      const notesPayload = await Promise.all(
        localNotes.map(async (note) => {
          let categoryId = note.category_id

          // Change the category id to its remote id
          if (categoryId != null) {
            const localCategory = await this.categoryLocalRepository.getById(categoryId)
            categoryId = localCategory?.remote_id ?? null
          }

          return {
            client_id: note.id,
            remote_id: note.remote_id,
            title: note.title,
            content: note.content,
            category_id: categoryId,
            is_deleted: note.is_deleted ?? 0,
            created_at: this.ensureUTCFormat(note.created_at),
            updated_at: this.ensureUTCFormat(note.updated_at),
          }
        })
      )

      // Make sync request
      const response = await httpClient.post('/notes/sync', { notes: notesPayload })

      if (response.data.state === 'NOTES_HAVE_SYNCED') {
        const successResponse = response.data as NotesResponseSucceed

        for (const noteResponse of successResponse.notes) {
          const noteData = noteResponse as Record<string, unknown>
          const localNoteId = noteData['client_id'] as number
          const localNote = localNotes.find((note) => note.id === localNoteId)

          if (!localNote) {
            throw new Error('Local note not found')
          }

          await this.handleNoteResponse(localNote, noteData)
        }
      } else if (response.data.state === 'NOTES_SYNC_IS_FAILED') {
        throw new Error(`Notes sync failed: ${response.data.errorMessage}`)
      } else {
        throw new Error(`Unexpected response state: ${response.data.state}`)
      }
    } catch (error) {
      console.error('Failed synchronizing local notes:', error)
      // Don't rethrow here as this is a supplementary operation
    }
  }

  private static async handleNoteResponse(
    localNote: Note,
    responseData: Record<string, any>
  ): Promise<void> {
    try {
      switch (responseData['state']) {
      case 'NOTE_ID_IS_NOT_PROVIDED': {
        const response = responseData as RemoteNoteIdIsNotProvidedResponse

        // Note was created on remote, update local with remote_id
        if (response.remote_id != null) {
          await this.noteLocalRepository.update(localNote.id, {
            remoteId: response.remote_id,
            categoryId: localNote.category_id,
            updatedAt: localNote.updated_at.toString(),
          })
          console.log(
            `Updated local note ${localNote.title} with remote_id: ${response.remote_id}`
          )
        } else {
          console.error(`Failed to create note ${localNote.title} on remote: ${response.message}`)
        }
        break
      }

      case 'NOTE_IN_THE_REMOTE_IS_NEWER': {
        const response = responseData as RemoteNoteIsNewerResponse
        let categoryId: number | null = null

        // Handle category update
        const remoteCategoryId = response.category_id
        if (remoteCategoryId != null) {
          const localCategory = await this.categoryLocalRepository.getByRemoteId(remoteCategoryId)
          if (localCategory) categoryId = localCategory.id
        }

        await this.noteLocalRepository.update(localNote.id, {
          title: response.title,
          content: response.content,
          categoryId: categoryId,
          remoteId: response.remote_id,
          isDeleted: response.is_deleted,
          updatedAt: response.updated_at,
        })

        console.log(`Updated local note ${localNote.title} with newer remote data`)
        break
      }

      case 'NOTE_IN_THE_REMOTE_IS_DEPRECATED': {
        const response = responseData as RemoteNoteIsDeprecatedResponse
        if (response.message?.includes('updated')) {
          console.log(`Successfully updated remote note for ${localNote.title}`)
        } else {
          console.error(`Failed to update remote note for ${localNote.title}: ${response.message}`)
        }
        break
      }

      case 'NOTE_ID_IS_NOT_VALID': {
        const response = responseData as RemoteNoteIdIsNotValidResponse
        console.error(`Invalid remote_id for note ${localNote.title}: ${response.remote_id}`)
        break
      }

      case 'AN_ERROR_OCCURRED_IN_THIS_NOTE': {
        const response = responseData as ErrorIsOccurredNoteResponse
        console.error(`Error occurred for note ${localNote.title}: ${response.errorMessage}`)
        break
      }

      case 'NOTE_IS_NOT_FOUND_IN_THE_REMOTE': {
        const response = responseData as NoteIsNotFoundInRemoteResponse
        await this.noteLocalRepository.delete(response.client_id)
        console.log(
          `Note ${response.title} not found on remote, it may have been deleted remotely. So it has been deleted locally too.`
        )
        break
      }

      case 'NOTE_IN_THE_REMOTE_IS_THE_SAME': {
        const response = responseData as NotesHaveSameTimesResponse
        console.log(
          `Note with Local ID: ${response.client_id} and Remote ID: ${response.remote_id} is still the same.`
        )
        break
      }

      default: {
        console.warn(`Unknown sync state for note ${localNote.title}: ${responseData['state']}`)
      }
      }
    } catch (error) {
      console.error(`Failed handling note response for ${localNote.title}:`, error)
      // Don't rethrow here as this is a supplementary operation
    }
  }

  private static async fetchNewNotesFromRemote(): Promise<void> {
    try {
      let url = '/notes'

      const notesWithRemoteId = await this.noteLocalRepository.getWithTrashed()
      const remoteIds = notesWithRemoteId
        .filter((note) => note.remote_id != null)
        .map((note) => note.remote_id)

      if (remoteIds.length > 0) {
        url += `?excepts=${remoteIds.join(',')}`
      }

      const response = await httpClient.get(url)

      if (response.status === 200) {
        const allRemoteNotesData = response.data.notes as unknown[]

        for (const remoteNoteRaw of allRemoteNotesData) {
          const remoteNoteData = remoteNoteRaw as FetchNoteResponse
          const currentRemoteNoteId = remoteNoteData.remote_id

          // Check if a local note with this remote_id exists
          const existingNote = await this.noteLocalRepository.getByRemoteId(currentRemoteNoteId)

          if (!existingNote) {
            // Parse timestamps from remote
            const createdAtStringFromRemote = remoteNoteData.created_at
            const updatedAtStringFromRemote = remoteNoteData.updated_at

            const createdAtUtc = new Date(createdAtStringFromRemote)
            const updatedAtUtc = new Date(updatedAtStringFromRemote)

            let categoryId: number | null = null

            // Attach the category to the note
            const remoteCategoryId = remoteNoteData.remote_category_id
            if (remoteCategoryId != null) {
              let localCategory = await this.categoryLocalRepository.getByRemoteId(remoteCategoryId)
              if (!localCategory) {
                localCategory = await this.categoryLocalRepository.create({
                  name: remoteNoteData.remote_category_name,
                  remoteId: remoteCategoryId,
                  orderIndex: remoteNoteData.remote_category_order_index,
                })
              }
              categoryId = localCategory.id
            }

            // Insert the remote note to the local database
            await this.noteLocalRepository.create({
              title: remoteNoteData.title,
              content: remoteNoteData.content,
              categoryId: categoryId,
              remoteId: currentRemoteNoteId,
            })
            console.log(`Created new local note from remote: ${remoteNoteData.title}`)
          }
        }
      } else {
        console.error(
          `Failed to fetch remote notes. Status: ${response.status}, Data: ${response.data}`
        )
      }
    } catch (error) {
      console.error('Failed fetching new remote notes:', error)
      // Don't rethrow here as this is a supplementary operation
    }
  }

  /**
   * Helper method to ensure timestamps are in UTC ISO format
   */
  private static ensureUTCFormat(timestamp: string | Date): string {
    try {
      const dateTime = typeof timestamp === 'string' ? new Date(timestamp) : timestamp

      // Check if the date string already includes timezone info
      if (typeof timestamp === 'string' && timestamp.includes('Z')) {
        return new Date(timestamp).toISOString()
      }

      // If no timezone info, assume UTC
      return dateTime.toISOString()
    } catch (error) {
      console.error(`Failed parsing timestamp: ${timestamp}, error:`, error)
      // Return current UTC time as fallback
      return new Date().toISOString()
    }
  }

  public static async run(): Promise<SyncResult> {
    try {
      await this.synchronizeLocalCategoriesWithRemote()
      await this.fetchNewCategoriesFromRemote()
      await this.synchronizeLocalNotesWithRemote()
      await this.fetchNewNotesFromRemote()

      return {
        status: 'success',
        categoriesSync: 'success',
        notesSync: 'success',
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }
    }
  }
}