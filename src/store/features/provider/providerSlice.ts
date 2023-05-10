import { createSlice } from '@reduxjs/toolkit'
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet, polygon, bsc } from "wagmi/chains";
import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";
const chains = [polygon, mainnet, bsc];
const projectId = process.env.REACT_APP_PROJECT_ID;

// Wagmi client
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


export interface ProviderState {
  wagmiClient: any;
  chains: typeof chains;
}


const initialState: ProviderState = {
  wagmiClient,
  chains,
}

export const providerSlice = createSlice({
  name: 'provider' as const,
  initialState,
  reducers: {},
})

export default providerSlice.reducer
