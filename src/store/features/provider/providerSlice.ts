import { createSlice } from '@reduxjs/toolkit'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, polygon, bsc } from "wagmi/chains";
const chains = [polygon, mainnet, bsc];
const projectId = process.env.REACT_APP_PROJECT_ID;

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

export interface ProviderState {
  wagmiConfig: any;
  ethereumClient: EthereumClient;
}


const initialState: ProviderState = {
  wagmiConfig,
  ethereumClient,
}

export const providerSlice = createSlice({
  name: 'provider' as const,
  initialState,
  reducers: {},
})

export default providerSlice.reducer
