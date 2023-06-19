import React from "react";
import ReactDOM from "react-dom";
import { TourProvider } from "@reactour/tour";
import { BrowserRouter } from "react-router-dom";
import * as Sentry from "@sentry/react";
import {
  WebviewType,
  AdaptivityProvider,
  ConfigProvider,
} from "@vkontakte/vkui";

import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";

import { Web3Modal } from "@web3modal/react";

import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet, polygon, arbitrum, bsc, optimism } from "wagmi/chains";

import { App } from "./App";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { steps } from "./guid/steps";

const chains = [polygon, mainnet, arbitrum, bsc, optimism];
const projectId = import.meta.env.VITE_REACT_APP_PROJECT_ID;

const { provider } = configureChains(chains, [
  walletConnectProvider({ projectId }),
]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({
    projectId,
    version: "1", // or "2"
    appName: "Polus Pay",
    chains,
  }),
  provider,
});

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_REACT_APP_SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: [import.meta.env.VITE_REACT_API_URL],
      }),
      new Sentry.Replay({ maskAllText: false, blockAllMedia: false }),
    ],
    tracesSampleRate: parseFloat(import.meta.env.VITE_REACT_SENTRY_TRACES_SAMPLE_RATE) || 0.1,
    replaysSessionSampleRate: parseFloat(import.meta.env.VITE_REACT_SENTRY_REPLAYS_SESSION_SAMPLE_RATE) || 0.1,
    replaysOnErrorSampleRate: parseFloat(import.meta.env.VITE_REACT_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE) || 1.0,
  });
}

// Web3Modal Ethereum Client
const ethereumClient = new EthereumClient(wagmiClient, chains);

const ConfigProviderFix: any = ConfigProvider;
const AdaptivityProviderFix: any = AdaptivityProvider;

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter basename="/">
      <WagmiConfig client={wagmiClient}>
        <React.StrictMode>
          <ConfigProviderFix
            appearance={"dark"}
            webviewType={WebviewType.INTERNAL}
            platform="ios"
          >
            <AdaptivityProviderFix>
              <TourProvider
                steps={steps}
                styles={{
                  popover: (base) => ({
                    ...base,
                    backgroundColor: "#18181e",
                    borderRadius: 8,
                    boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)",
                    color: "#fff",
                    justifyContent: "center",


                  }),
                  button: (base) => ({
                    ...base,
                    // background: "linear-gradient(235deg, #5ddcff, #3c67e3 43%, #4e00c2)",
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    padding: "8px 16px",
                    textTransform: "uppercase",
                    border: "none",
                    boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)",
                    color: "#fff",
                  }),
                  close: (base) => ({
                    ...base,
                    // color: "#fff",
                    display: "none",
                  }),
                  dot: (base) => ({
                    ...base,
                  }),
                  arrow: (base) => ({
                    ...base,
                  }),

                }}
              >
                <App />
              </TourProvider>
            </AdaptivityProviderFix>
          </ConfigProviderFix>
        </React.StrictMode>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </BrowserRouter>
  </Provider>,
  document.querySelector("#root")
);
