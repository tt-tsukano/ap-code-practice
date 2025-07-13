/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // より多くの環境変数を追加...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}