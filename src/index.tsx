import React from "react";
import ReactDOM from "react-dom";
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
import { Provider } from 'react-redux'

import { Web3Modal } from "@web3modal/react";

import { configureChains, createClient, WagmiConfig } from "wagmi";

import { mainnet, polygon, bsc } from "wagmi/chains";

import { App as Application } from "./App";
import { store } from "./store/store";

const el = document.createElement("div");
document.body.appendChild(el);

// eruda.init({
//     container: el,
//     tool: [ 'console', 'elements' ]
// })




if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: 'https://f4c739a8a9994899b24d8ef65e95b721@o1066986.ingest.sentry.io/4505150834737152',
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({ maskAllText: true, blockAllMedia: false }),
    ],

    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!

    // Session Replay
    replaysSessionSampleRate: 1.0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}



// Web3Modal Ethereum Client

const ConfigProviderFix: any = ConfigProvider;
const AdaptivityProviderFix: any = AdaptivityProvider;


const App = () => (
  <BrowserRouter basename="/">
    <WagmiConfig client={wagmiClient}>
      <React.StrictMode>
        <ConfigProviderFix
          appearance={"dark"}
          webviewType={WebviewType.INTERNAL}
          platform="ios"
        >
          <AdaptivityProviderFix>
            <Application />
          </AdaptivityProviderFix>
        </ConfigProviderFix>
      </React.StrictMode>
    </WagmiConfig>
    <Web3Modal
      projectId="2e6208d8c73f2b1560e96b4e757bb4a1"
      ethereumClient={ethereumClient}
    />
  </BrowserRouter>
)

ReactDOM.render(
  <Provider store={store}>
    <App />,
  </Provider>,
  document.querySelector("#root")
);
