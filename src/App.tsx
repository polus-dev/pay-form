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
    Snackbar,
    ScreenSpinner,
    PanelHeader,
    CardGrid,
    Card,
    SimpleCell
} from '@vkontakte/vkui'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import { Icon24Dismiss, Icon28CancelCircleFillRed, Icon28CheckCircleFill } from '@vkontakte/icons'

import { Web3Button } from '@web3modal/react'

import '@vkontakte/vkui/dist/vkui.css'
import './style.css'

import { tokens } from './logic/tokens'
import { Main } from './pages/main'

import logo from './img/logo.svg'

export const App: React.FC = () => {
    const [ activeModal, setActiveModal ] = React.useState<any>(null)

    const [ snackbar, setSnackbar ] = React.useState<any>(null)

    const [ popout, setPopout ] = React.useState<any>(null)

    const [ firstRender, setFirstRender ] = React.useState<boolean>(false)

    const isDesktop = window.innerWidth >= 800

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

    useEffect(() => {
        if (!firstRender) {
            setFirstRender(true)

            // checkAuth()
        }
    }, [])

    const modalRoot = (
        <ModalRoot activeModal={activeModal} >
            <ModalPage
                id={'network'}
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
                  Select network
                    </ModalPageHeader>
                }
            >
                <Div>
                </Div>
            </ModalPage>

            <ModalPage
                id={'coins'}
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
                  Select Token
                    </ModalPageHeader>
                }
            >
                <Div>
                    <CardGrid size="l">
                        {tokens.polygon.map((token, key) => (
                            <Card key={key}>
                                <SimpleCell
                                    before={<img src={token.icon} style={{ marginRight: '12px' }} />}
                                >
                                    {token.name.toUpperCase()}
                                </SimpleCell>
                            </Card>
                        ))}

                    </CardGrid>
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
                header={ <PanelHeader
                    separator={false}
                    before={
                        <a href="https://poluspay.com" target="_blank">
                            <img src={logo} />
                        </a>
                    }
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
