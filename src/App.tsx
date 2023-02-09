import React, { useEffect } from 'react'

import {
    AppRoot,
    SplitLayout,
    SplitCol,
    View,
    ModalRoot,
    ModalPage,
    ModalPageHeader,
    PanelHeaderButton,
    Div,
    FormItem,
    Input,
    Button,
    Textarea,
    Snackbar,
    ScreenSpinner,
    PanelHeader} from '@vkontakte/vkui'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import { Icon24Dismiss, Icon28CancelCircleFillRed, Icon28CheckCircleFill } from '@vkontakte/icons'
import { VldBuilder, vlds } from 'validatorus-react'

import { Web3Button } from '@web3modal/react'

import '@vkontakte/vkui/dist/vkui.css'
import './style.css'

import { MerchantCreate } from 'backend/scheme/requests'

import { BackendClient } from './backend/client'
import { MerchantRepo, NewReposWithClient, PaymentRepo, UserRepo } from './backend/api'

import { Main } from './pages/main'

import logo from './img/logo.svg'


function truncAddress (address: any): string {
    return `${address.slice(0, 5)}...${address.slice(-5)}`
}

type Asset = 'USDC' | 'USDT' | 'WETH'

const url = 'https://pay.polus.fi'

const client = new BackendClient({ url })

export const App: React.FC = () => {
    const [ activeModal, setActiveModal ] = React.useState<any>(null)

    const [ snackbar, setSnackbar ] = React.useState<any>(null)

    const [ popout, setPopout ] = React.useState<any>(null)

    const [ firstRender, setFirstRender ] = React.useState<boolean>(false)

    const [ loginPage, setLoginPage ] = React.useState<boolean>(false)

    const [ auth, setAuth ] = React.useState<number>(0)

    const [ api, setApi ] = React.useState<{
        user: UserRepo,
        merch: MerchantRepo,
        pay: PaymentRepo }>(NewReposWithClient(client))

    const isDesktop = window.innerWidth >= 900

    const location = useLocation()

    const history = useNavigate()

    function openPop () {
        setPopout(<ScreenSpinner state="loading" />)
    }

    function closePop (type: boolean) {
        if (popout) {
            if (type) setPopout(<ScreenSpinner state="done" aria-label="Success" />)
            else setPopout(<ScreenSpinner state="error" aria-label="Error" />)

            setTimeout(() => {
                setPopout(null)
            }, 1000)
        }
    }

    function clearToken () {
        localStorage.setItem('polus_jwt', JSON.stringify(null))
    }

    const input = new VldBuilder()
        .with(vlds.VLen, 4, 128)
        .withFname('Merchant name')

    const inputAddress = new VldBuilder()
        .with(vlds.VHex)
        .with(vlds.VLen, 42, 42)
        .withFname('Withdrawal address')

    const inputLink = new VldBuilder()
        .with(vlds.VDomain)
        .withFname('Website link')

    const inputDesc = new VldBuilder()
        .with(vlds.VLen, 10, 256)
        .withFname('Description')

    async function logOut () {
        setAuth(1)
        setLoginPage(true)
        history('/')

        clearToken()
    }

    function consoleLog (data: string, type:boolean = false) {
        setSnackbar(
            <Snackbar
                before={
                    type ? <Icon28CheckCircleFill /> : <Icon28CancelCircleFillRed />
                }
                onClose={() => setSnackbar(null)}
            >
                {data}
            </Snackbar>
        )
    }

    async function createMerchant () {
        const data: MerchantCreate = {
            name: input.value,
            address: inputAddress.value,
            description: inputDesc.value,
            website: inputLink.value
        }
        const resp = await api.merch.create(data)
        if (resp.status !== 'ok') {
            console.log('status not ok:', resp)
            consoleLog(resp.desc)

            if (resp.code === 1105) {
                logOut()
            }
            return false
        }

        console.log(resp.result)

        history(`/merchant/${resp.result.merchant_id}`)
        setActiveModal(null)
        return true
    }

    useEffect(() => {
        if (!firstRender) {
            setFirstRender(true)

            // checkAuth()
        }
    }, [])

    useEffect(() => {
        if (api.user._client.jwt !== '') {
            // getUser()
        }
    }, [ api ])

    useEffect(() => {
        // input.reset(true, true)
        // inputAddress.reset(true, true)
        // inputDesc.reset(true, true)
        // inputLink.reset(true, true)
        // inputDel.reset(true, true)
        // inputCreateValue.reset(true, true)
        // inputCreatAsset.change('USDC')
        // inputCreateDesc.reset(true, true)
    }, [ activeModal ])

    const modalRoot = (
        <ModalRoot activeModal={activeModal} >
            <ModalPage
                id={'create_merchant'}
                className="polus"
                onClose={() => setActiveModal(null)}
                dynamicContentHeight
                // settlingHeight={100}
                header={
                    <ModalPageHeader
                        after={
                            !isDesktop && (
                                <PanelHeaderButton onClick={() => setActiveModal(null)}>
                                    <Icon24Dismiss />
                                </PanelHeaderButton>
                            )
                        }
                    >
                  New merchant
                    </ModalPageHeader>
                }
            >
                <Div>
                    <FormItem
                        top="Merchant name"
                        bottom={input.error}
                    >
                        <Input
                            type="text"
                            placeholder='Company name'
                            value={input.value}
                            onChange={(e) => { input.change(e.target.value) }}
                            status={input.iserr}
                        />
                    </FormItem>
                    <FormItem top="Merchant website link" bottom={inputLink.error}>
                        <Input
                            type="text"
                            placeholder='example.com'
                            value={inputLink.value}
                            onChange={(e) => { inputLink.change(e.target.value) }}
                            status={inputLink.iserr}
                        />
                    </FormItem>
                    <FormItem top="Withdrawal address" bottom={inputAddress.error}>
                        <Input
                            type="text"
                            placeholder='0x...'
                            value={inputAddress.value}
                            onChange={(e) => { inputAddress.change(e.target.value) }}
                            status={inputAddress.iserr}
                        />
                    </FormItem>
                    <FormItem top="Description" bottom={inputDesc.error}>
                        <Textarea
                            placeholder='Few words about merchant...'
                            value={inputDesc.value}
                            onChange={(e) => { inputDesc.change(e.target.value) }}
                            status={inputDesc.iserr}
                        ></Textarea>
                    </FormItem>
                    <FormItem>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {/* <Button
                                size="l"
                                stretched
                                mode="outline"
                                style={{ marginRight: '16px' }}
                                onClick={() => setActiveModal(null)}
                            >Cancel</Button> */}
                            <Button
                                size="l"
                                stretched
                                // disabled={!formCreateM}
                                disabled={
                                    !(inputAddress.iserr === 'valid'
                                    && inputLink.iserr === 'valid'
                                    && input.iserr === 'valid'
                                    )
                                }
                                onClick={() => {
                                    createMerchant()
                                }}
                            >Create merchant</Button>
                        </div>
                    </FormItem>
                </Div>
            </ModalPage>

        </ModalRoot>
    )

    return (
        <AppRoot>
            <SplitLayout
                className="polus"
                style={{ justifyContent: 'center' }}
                modal={modalRoot}
                popout={popout}
                header={isDesktop
                    && <PanelHeader
                        separator={false}
                        before={<img src={logo} />}
                        after={<Web3Button />}
                        className="polus-header"
                    />
                }
                // header={
                //     <HeaderBlock />
                // }
            >

                <SplitCol
                    animate={false}
                    spaced={isDesktop}
                    width={isDesktop ? '450px' : '100%'}
                    maxWidth={isDesktop ? '450px' : '100%'}
                >

                    <div id="main">
                        <Routes>
                            <Route path="/" element={
                                <View activePanel={'main1'} id="view">
                                    <Main
                                        id="main1"
                                        setActiveModal={setActiveModal}
                                        consoleLog={consoleLog}
                                        logOut={logOut}
                                        isDesktop={isDesktop}
                                        openPop={openPop}
                                        closePop={closePop}
                                    />
                                </View>
                            } />

                        </Routes>
                    </div>

                </SplitCol>

                {snackbar}
            </SplitLayout>
        </AppRoot>
    )
}
