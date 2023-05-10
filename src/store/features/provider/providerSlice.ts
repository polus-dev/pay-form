import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'



import { configureChains, createClient, WagmiConfig } from "wagmi";

import { mainnet, polygon, bsc } from "wagmi/chains";

import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";

const chains = [polygon, mainnet, bsc];

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

const ethereumClient = new EthereumClient(wagmiClient, chains);



export interface ProviderState {
  ethereumClient: EthereumClient,
}


const initialState = {
  ethereumClient,
}

export const providerSlice = createSlice({
  name: 'provider',
  initialState,
  reducers: {},
})

// Action creators are generated for each case reducer function

export default providerSlice.reducer
