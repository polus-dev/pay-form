import React from 'react'
import eruda from 'eruda'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

import { WebviewType, AdaptivityProvider, ConfigProvider, IOS } from '@vkontakte/vkui'

import {
    EthereumClient,
    modalConnectors,
    walletConnectProvider
} from '@web3modal/ethereum'

import { Web3Modal } from '@web3modal/react'

import { configureChains, createClient, WagmiConfig } from 'wagmi'

import { arbitrum, mainnet, polygon } from 'wagmi/chains'

import { App } from './App'

const el = document.createElement('div')
document.body.appendChild(el)

// eruda.init({
//     container: el,
//     tool: [ 'console', 'elements' ]
// })

const chains = [ mainnet, polygon ]

// Wagmi client
const { provider } = configureChains(chains, [
    walletConnectProvider({ projectId: '2e6208d8c73f2b1560e96b4e757bb4a1' })
])
const wagmiClient = createClient({
    autoConnect: true,
    connectors: modalConnectors({
        projectId: '2e6208d8c73f2b1560e96b4e757bb4a1',
        version: '1', // or "2"
        appName: 'Polus Pay',
        chains
    }),
    provider
})

// Web3Modal Ethereum Client
const ethereumClient = new EthereumClient(wagmiClient, chains)

const ConfigProviderFix: any = ConfigProvider
const AdaptivityProviderFix: any = AdaptivityProvider

ReactDOM.render(
    <BrowserRouter
        basename='/'
    >
        <WagmiConfig client={wagmiClient}>
            <React.StrictMode>

                <ConfigProviderFix
                    appearance={'dark'}
                    webviewType={WebviewType.INTERNAL}
                    platform={IOS}
                >

                    <AdaptivityProviderFix >
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
    document.querySelector('#root')
)
