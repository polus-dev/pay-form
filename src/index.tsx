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

import { Web3Modal } from "@web3modal/react";

import { configureChains, createClient, WagmiConfig } from "wagmi";

import { mainnet, polygon, bsc, arbitrum } from "wagmi/chains";

import { App } from "./App";

const el = document.createElement("div");
document.body.appendChild(el);

// eruda.init({
//     container: el,
//     tool: [ 'console', 'elements' ]
// })

const chains = [polygon, mainnet, bsc, arbitrum];

// Wagmi client
const { provider } = configureChains(chains, [
  walletConnectProvider({ projectId: "2e6208d8c73f2b1560e96b4e757bb4a1" }),
]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({
    projectId: "2e6208d8c73f2b1560e96b4e757bb4a1",
    version: "1", // or "2"
    appName: "Polus Pay",
    chains,
  }),
  provider,
});



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
const ethereumClient = new EthereumClient(wagmiClient, chains);

const ConfigProviderFix: any = ConfigProvider;
const AdaptivityProviderFix: any = AdaptivityProvider;

ReactDOM.render(
  <BrowserRouter basename="/">
    <WagmiConfig client={wagmiClient}>
      <React.StrictMode>
        <ConfigProviderFix
          appearance={"dark"}
          webviewType={WebviewType.INTERNAL}
          platform="ios"
        >
          <AdaptivityProviderFix>
            <App />
          </AdaptivityProviderFix>
        </ConfigProviderFix>
      </React.StrictMode>
    </WagmiConfig>
    <Web3Modal
      projectId="2e6208d8c73f2b1560e96b4e757bb4a1"
      ethereumClient={ethereumClient}
    />
  </BrowserRouter>,
  document.querySelector("#root")
);
