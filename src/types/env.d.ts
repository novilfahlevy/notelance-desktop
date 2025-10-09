declare namespace NodeJS {
  interface ProcessEnv {
    readonly REMOTE_BASE_URL: string
    readonly REMOTE_API_KEY: string
  }
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}