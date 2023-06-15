/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv;

}

interface ImportMetaEnv {
  readonly VITE_REACT_APP_PROJECT_ID: string;
  readonly VITE_REACT_APP_SENTRY_DSN: string;
  readonly VITE_REACT_APP_CHEAT_CODE: string;
  readonly VITE_REACT_API_URL: string;
}
