/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/naming-convention */
import {
    Button,
    Div,
    Panel,
    PanelHeader,
    Progress,
    Spinner
} from "@vkontakte/vkui"

import React, { memo, useEffect, useMemo, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { useWeb3Modal } from "@web3modal/react"

import { useAccount, useNetwork, useSwitchNetwork } from "wagmi"
import { polygon } from "wagmi/chains"
import {
    Icon28CheckCircleFill,
    Icon28ChevronDownOutline,
    Icon28DoneOutline,
    Icon28WarningTriangleOutline
} from "@vkontakte/icons"

import logo from "../../img/logo.svg"
import maticLogo from "../../img/matic.svg"
import otherLogo from "../../img/other.svg"
import etherLogo from "../../img/weth.svg"
import bnbLogo from "../../img/bnb.svg"

import btn from "../../img/btn.jpg"
import wc from "../../img/wc.svg"

import { fullListTokens, supportedChain } from "../../logic/tokens"
import { Invoice } from "../../logic/types"
import { Info, InvoiceType, PolusApi } from "../../logic/api"

import { ListToken, ListTokens, Payment, PolusChainId } from "../../logic/payment"
import { NtoStr, getParameterByName } from "../../logic/utils"
import { Tron } from "./tron"
import { REACT_APP_TURN_OFF_TIMER } from "../../constants"
import { CheatCodeListener } from "../../components/CheatCodeListener"
import { ProcessBlock } from "../../components/ProcessBlock"
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { ProgressBar } from "../../components/ui/ProgressBar"
import { setSmartLineStatus, SmartLineStatus } from "../../store/features/smartLine/smartLineSlice"


interface MainProps {
    id: string,
    setActiveModal: Function,
    consoleLog: Function,
    isDesktop: boolean,
    openPop: Function,
    closePop: Function,
    setTron: Function,
    tron: boolean,
    seletcToken: ListToken | undefined,
    setSelectToken: Function,
    setAllowTron: Function
}

interface ErrorType {
    text: string,
    code: number
}
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))







export const Main: React.FC<MainProps> = memo((props: MainProps) => {
    const [firstRender, setFirstRender] = React.useState<boolean>(false)
    const [type, setType] = React.useState<number>(0)

    const [ready, setReady] = React.useState<boolean>(false)
    const [payed, setPayed] = React.useState<boolean>(false)

    const [timer, setTimer] = React.useState<string>("00:00")
    const [cheatCode, setCheatCode] = React.useState(false)

    const [reRender, setRerender] = React.useState<boolean>(false)
    const smartLineStatus = useAppSelector(state => state.stamrtLine.smartLineStatus)

    const [coin, setCoin] = React.useState<ListToken>(fullListTokens[0])
    const [coinInvoice, setCoinInvoice] = React.useState<string>("0")
    const [coinMerchant, setCoinMerchant] = React.useState<ListToken>(
        fullListTokens[0]
    )
    const abortRef = useRef(() => { })
    const dispatch = useAppDispatch();

    const { isOpen, open, close, setDefaultChain } = useWeb3Modal()
    const { address, isConnected } = useAccount()

    const { chain } = useNetwork()
    const { chains, error, isLoading, pendingChainId, switchNetwork } =
        useSwitchNetwork()

    const [info, setInfo] = React.useState<Info | undefined | false>(undefined)

    const [errorObj, setErrorObj] = React.useState<ErrorType | undefined>(
        undefined
    )

    const [progress, setProgress] = React.useState<number>(0)

    const [fullListTokensUp, setFullListTokensUp] =
        React.useState<ListTokens>(fullListTokens)


    const polusApi = useMemo(() => new PolusApi(), []);


    function startTimer(inf: InvoiceType) {
        const eventTime = Number(inf.expires_at)
        const currentTime = Date.now() / 1000
        let diffTime = eventTime - currentTime - 1;
        const interval = 1000

        if (diffTime < 0) return

        const interv = setInterval(() => {
            const minutes = Math.floor(diffTime / 60)
            const seconds = Math.floor(diffTime % 60)
            if (diffTime <= 0) clearInterval(interv)
            setTimer(`${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`)
            diffTime--;
        }, interval)
    }

    function chCoinNew(token: ListToken, info1: false | Info | undefined = info) {
        setCoin(token)
        if (info1) {
            const merchantToken = fullListTokensUp.filter(
                t => t.name.toLowerCase() === info1.invoice.asset.toLowerCase()
            )[0]
            setCoinMerchant(merchantToken)
            console.log("Select merchant", merchantToken)
        }
        console.log("Select coin", token)
    }

    async function swithNet(id: number) {
        props.openPop()
        console.log("swithNet", id)
        if (!switchNetwork || !id) {
            return false
        }

        await switchNetwork(id)
        return true
    }

    async function getInfo(uuid1: string, type1: boolean = true) {
        const data = await polusApi.getInfo(uuid1)
        if (!data) {
            props.consoleLog("Error load info", false)
            setInfo(false)
            setErrorObj({
                text: "Error load data invoice",
                code: 1002
            })
            return undefined
        }

        if (data.invoice.status === 'success') {
            setErrorObj({
                text: 'Paid',
                code: 1003
            })
        }
        if (data.invoice.status === 'in_progress') {
            setErrorObj({
                text: 'Invoice in progress',
                code: 1004
            })
        }
        if (data.invoice.status === 'failed') {
            setErrorObj({
                text: 'Failed',
                code: 1005
            })
        }
        if (type1) {
            startTimer(data.invoice)
        }

        if (type1) {
            setDefaultChain(polygon)
            setInfo(data)

            const currentT = fullListTokens.filter(
                t => t.name.toLowerCase() === data.invoice.asset.toLowerCase()
            )[0]

            const fullList = await Payment.getAllAmountIn(
                data.invoice.asset_amount.toString(),
                currentT
            )

            setFullListTokensUp(fullList)

            chCoinNew(fullList.filter(t => t.namePrice === coin.namePrice)[0], data) // update amountIn
        } else if (data.invoice.status === 'success' || data.invoice.status === 'failed') {
            setInfo(data)
        }

        setRerender(!reRender)


        if (data.invoice.status === 'in_progress' || data.invoice.status === 'pending') {
            await sleep(5000)
            getInfo(uuid1, false)
        }

        return true
    }

    async function startPay() {
        if (!ready) {
            await swithNet(137)
        }

        setType(1)

        if (!chain || !address) {
            return false
        }
        // const PolusUtils = new PolusTokenUtils(coin, chain.id, address)
        // PolusUtils.isApprove()

        return true
    }

    function generatedUrlRedirect(status: string) {
        if (info) {
            if (status === "sucess") {
                return info.merchant?.success_redirect_url ?? undefined
            }
            return info.merchant?.fail_redirect_url ?? undefined
        }
        return undefined
    }

    function getSubCoin(list: ListTokens) {

        const _list = list.slice(4, list.length)

        for (let i = 0; i < _list.length; i++) {
            if (_list[i].name === coin.name) {
                return [coin]
            }
        }
        return [_list[0]]
    }

    useEffect(() => {
        if (isLoading === false) {
            if (error) {
                console.log(error)
                props.consoleLog("Error network change", false)
                props.closePop(false)
            } else {
                props.closePop(true)
            }
        }
    }, [isLoading])

    useEffect(() => {
        console.log("pendingChainId", pendingChainId)
    }, [pendingChainId])

    useEffect(() => {
        console.log("chain", chain)
        if (!chain) {
            setReady(false)
            console.error("not found network")
        } else if (supportedChain.includes(chain.id as PolusChainId)) {
            setReady(true)

            // changeCoin(coin, chain.id)
        } else {
            setReady(false)
            // swithNet('polygon')
        }
        props.closePop(false)
        props.setActiveModal(null)
        close()
    }, [chain])

    useEffect(() => {
        if (props.seletcToken) {
            chCoinNew(props.seletcToken)
        }
    }, [props.seletcToken])

    useEffect(() => {
        if (info) {
            // chCoinNew(fullListTokensUp[0])
            // changeCoin(tokens.polygon[0], 137)
        }
    }, [info])

    useEffect(() => {
        if (isConnected) {
            setProgress(25)
        } else {
            setProgress(0)
        }
    }, [isConnected])

    useEffect(() => {
        if (!firstRender) {
            setFirstRender(true)

            const uuid1 = getParameterByName("uuid")
            if (uuid1 && uuid1 !== "") {
                // setUuid(uuid1)
                getInfo(uuid1)

                // setInterval(() => getInfo(uuid1), 10000)
            } else {
                setErrorObj({
                    text: "Invalid uuid param",
                    code: 1001
                })
                setInfo(false)
            }

        }
    }, [])

    useEffect(() => {
        if (type === 0) {
            props.setTron(false)
        }
    }, [type])

    useEffect(() => {
        props.setSelectToken(coin)
    }, [coin])

    useEffect(() => {
        if (info) {
            if (info.invoice.tron_withdraw_address === null && props.tron) {
                setType(0)
            } else if (info.invoice.tron_withdraw_address && props.tron) {
                setType(1)
                setCoin(fullListTokens[0])
            }
        }
    }, [info, props.tron])

    return (
        <Panel id={reRender ? props.id : "render"}>
            <PanelHeader separator={false} />

            {!errorObj && info && coin ? (
                <div className={`pay-block smart-line ${smartLineStatus}`}>
                    <div className="slide-in-bck-center">
                        <div className="domain-block">
                            <div className="domain-amount-block">
                                <span>{info.merchant?.domain.replace("https://", "")}</span>
                                <div className="amount-block">
                                    {NtoStr(coin.amountIn)}
                                    <span>{coin.name.toUpperCase()}</span>
                                </div>
                            </div>
                            <span
                                className="opacity-block"
                                style={{ marginTop: "10px", display: "block" }}
                            >
                                {info.invoice.description}
                            </span>
                        </div>
                    </div>
                    <ProgressBar value={progress} />
                    <div>
                        {type === 0 ? (
                            <div>
                                {/* <SegmentedControl
                                style={{ marginTop: '24px' }}
                                size="l"
                                onChange={e => swithNet(e)}
                                value={chain?.id === 1 ? 'ethereum' : 'polygon'}
                                options={[
                                    {
                                        label: 'Ethereum',
                                        value: 'ethereum',
                                        'aria-label': 'Ethereum'
                                    },
                                    {
                                        label: 'Polygon',
                                        value: 'polygon',
                                        'aria-label': 'Polygon'
                                    }
                                ]}
                            /> */}

                                <div className="text-one">Choose network</div>

                                <div
                                    className="selector"
                                    onClick={() => {
                                        // if (isConnected) {
                                        props.setActiveModal("network")
                                        // } else {
                                        //     open();
                                        // }
                                    }}
                                >
                                    {chain ? (
                                        <div className="selector-right">
                                            {chain.id === 1 ? <img src={etherLogo} /> : null}
                                            {chain.id === 137 ? <img src={maticLogo} /> : null}
                                            {chain.id === 56 ? <img src={bnbLogo} /> : null}
                                            {chain.id !== 137 && chain.id !== 1 && chain.id !== 56 ? (
                                                <img src={otherLogo} width={24} />
                                            ) : (
                                                ""
                                            )}
                                            <span>{chain.name}</span>
                                        </div>
                                    ) : (
                                        <div className="selector-right">
                                            <img src={maticLogo} />
                                            <span>Polygon</span>
                                        </div>
                                    )}

                                    <Icon28ChevronDownOutline />
                                </div>

                                <div className="text-one">Choose currency</div>

                                <div className="btn-block">
                                    {fullListTokensUp.slice(0, 3).map((token, key) => (
                                        <Button
                                            key={key}
                                            size="l"
                                            stretched
                                            className="fix-forpadding"
                                            onClick={() => chCoinNew(token)}
                                            mode={coin.name === token.name ? "primary" : "outline"}
                                            before={<img src={token.icon} className="logo-cur" />}
                                        >
                                            {token.name.toUpperCase()}
                                        </Button>
                                    ))}
                                </div>

                                <div className="btn-block">
                                    {fullListTokensUp.slice(3, 4).map((token, key) => (
                                        <Button
                                            key={key}
                                            size="l"
                                            stretched
                                            className="fix-forpadding"
                                            onClick={() => chCoinNew(token)}
                                            mode={coin.name === token.name ? "primary" : "outline"}
                                            before={<img src={token.icon} className="logo-cur" />}
                                        >
                                            {token.name.toUpperCase()}
                                        </Button>
                                    ))}

                                    {getSubCoin(fullListTokensUp).map((token, key) => (
                                        <Button
                                            key={key}
                                            size="l"
                                            stretched
                                            className="fix-forpadding"
                                            onClick={() => chCoinNew(token)}
                                            mode={coin.name === token.name ? "primary" : "outline"}
                                            before={<img src={token.icon} className="logo-cur" />}
                                        >
                                            {token.name.toUpperCase()}
                                        </Button>
                                    ))}

                                    <Button
                                        size="l"
                                        stretched
                                        onClick={() => props.setActiveModal("coins")}
                                        mode={"outline"}
                                        before={<img src={otherLogo} width={24} />}
                                    >
                                        Other
                                    </Button>
                                </div>
                                {/* <div className="block-tax" style={{ marginTop: '24px' }}>
                                <MiniInfoCell
                                    before={null}
                                    textWrap="full"
                                    textLevel="primary"
                                    after={'23%'}
                                >
                    TAX
                                </MiniInfoCell>
                                <Separator />
                                <MiniInfoCell
                                    before={null}
                                    textWrap="full"
                                    textLevel="primary"
                                    after={'1,000.00 USDT'}
                                >
                    Amount without TAX
                                </MiniInfoCell>
                                <Separator />
                                <MiniInfoCell
                                    before={null}
                                    textWrap="full"
                                    textLevel="primary"
                                    after={'230.00 USDT'}
                                >
                    Total TAX amount
                                </MiniInfoCell>
                                <Separator />
                                <MiniInfoCell
                                    before={null}
                                    textWrap="full"
                                    textLevel="primary"
                                    after={'1,230.00 USDT'}
                                >
                    Amount due
                                </MiniInfoCell>

                            </div> */}

                                <span className="timer-block">
                                    The invoice is active in {timer}
                                </span>

                                {/* <Web3Button /> */}

                                {isConnected ? (
                                    <Button
                                        stretched
                                        size="l"
                                        className="btn-connect"
                                        disabled={!cheatCode && timer === "00:00" || REACT_APP_TURN_OFF_TIMER}
                                        style={{ backgroundImage: `url(${btn})` }}
                                        onClick={() => startPay()}
                                    >
                                        Pay {NtoStr(coin.amountIn)} {coin.name.toUpperCase()}
                                    </Button>
                                ) : (
                                    <Button
                                        stretched
                                        size="l"
                                        className="btn-connect"
                                        style={{ backgroundImage: `url(${btn})` }}
                                        before={<img src={wc} />}
                                        onClick={() => open()}
                                        disabled={!cheatCode && timer === "00:00" || REACT_APP_TURN_OFF_TIMER}
                                    >
                                        Connect Wallet
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="proccess-block">
                                {address && chain ? (
                                    <div>
                                        <ProcessBlock
                                            id={"all1"}
                                            address={address}
                                            uuid={info.invoice.id}
                                            consoleLog={props.consoleLog}
                                            setPayed={setPayed}
                                            setProgress={setProgress}
                                            // NOTE: chainId must be a restriction of the supported chains
                                            chainId={chain.id as PolusChainId}
                                            addressMerchant={info.invoice.evm_withdraw_address}
                                            amountOut={info.invoice.asset_amount}
                                            tokenA={coin}
                                            tokenB={coinMerchant}
                                            fullListTokensUp={fullListTokensUp}
                                            fee={info.invoice.fee!}
                                            asset_amount_decimals_without_fee={
                                                info.invoice.asset_amount_decimals_without_fee!
                                            }
                                            asset_amount_decimals={info.invoice.asset_amount_decimals!}
                                            polusApi={polusApi}
                                            feeRecipient={info.invoice.evm_fee_address}
                                            amount={info.invoice.asset_amount}
                                            tokenAddress={coin.address[chain.id as PolusChainId]}
                                            isNativeToNative={
                                                Boolean(coin.native && coin.native === coinMerchant.native)
                                            }
                                            currentAddressToken={
                                                coinMerchant.address[chain.id as PolusChainId]
                                            }
                                            setAbortTransaction={abortRef}
                                        />
                                    </div>
                                ) : null}

                                {props.tron ? (
                                    <Tron
                                        id="tron1"
                                        address={info.invoice.tron_withdraw_address ?? ""}
                                        polusApi={polusApi}
                                        uuid={info.invoice.id}
                                        amount={info.invoice.tron_asset_amount ?? ''}
                                        log={props.consoleLog}
                                    />
                                ) : null}

                                {payed ? (
                                    <Button
                                        stretched
                                        size="l"
                                        className="btn-connect fix-padding"
                                        style={{ backgroundImage: `url(${btn})` }}
                                        href={generatedUrlRedirect("success")}
                                    >
                                        Back to store
                                    </Button>
                                ) : (
                                    <Button
                                        stretched
                                        size="l"
                                        className="btn-connect"
                                        style={{ backgroundImage: `url(${btn})` }}
                                        onClick={() => {
                                            abortRef.current()
                                            dispatch(setSmartLineStatus(SmartLineStatus.DEFAULT))
                                            setType(0);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        )}

                        <small className="small-block">
                            By making a payment, you agree to the <a href="">Terms of Use</a>
                            <br />
                            and <a href="">Privacy Policy</a>
                        </small>

                        <div className="logo-block">
                            <span>Powered by </span>
                            <a href="https://poluspay.com" target="_blank">
                                <img src={logo} />
                            </a>
                        </div>
                    </div>
                </div>
            ) : null}
            {!errorObj && !info ? (
                <div className={`pay-block  smart-line ${smartLineStatus}`}>
                    <div className="slide-in-bck-center"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "column"
                        }}
                    >
                        <Spinner size="large" style={{ margin: "20px 0" }} />
                    </div>
                </div>
            ) : null}

            {errorObj ? (
                <div className={`pay-block smart-line ${errorObj.code === 1005 || errorObj.code === 1002 ? "smart-line-error-color" : errorObj.code === 1003 ? "smart-line-succsess-color" : "smart-line-loading-color"} `}>
                    <div className="slide-in-bck-center"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "column"
                        }}
                    >
                        {errorObj.code === 1003 ?
                            <Icon28CheckCircleFill /> :
                            null}

                        {errorObj.code === 1004 ? <Spinner size="large" style={{ margin: "20px 0" }} /> : null}
                        {errorObj.code !== 1004 && errorObj.code !== 1003 ?
                            <Icon28WarningTriangleOutline fill="var(--vkui--color_background_negative)" /> : null}
                        <span style={{ margin: "16px 0" }}>{errorObj.text}</span>
                    </div>
                    {info ? (
                        <Button
                            stretched
                            size="l"
                            className="btn-connect"
                            style={{ backgroundImage: `url(${btn})` }}
                            // onClick={() => startPay()}
                            href={generatedUrlRedirect("error")}
                        >
                            Back to store
                        </Button>
                    ) : null}
                </div>
            ) : null}
            <CheatCodeListener code={process.env.REACT_APP_CHEAT_CODE!} onCheatCodeEntered={() => {
                setCheatCode(true);
                props.consoleLog("Cheat code entered", true)
            }} />
        </Panel>
    )
})








