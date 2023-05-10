export { };
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      RPC_URL: string;
      NETWORK: "mainnet" | "testnet";
      API_KEY: string;
      REACT_APP_PROJECT_ID: string;
      REACT_APP_SENTRY_DSN: string;
    }
  }
}
