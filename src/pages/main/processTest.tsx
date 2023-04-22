import {
    Icon24Spinner,
    Icon28CancelCircleOutline,
    Icon28CheckCircleOff,
    Icon28CheckCircleOn,
    Icon28RefreshOutline
} from '@vkontakte/icons'
import { SimpleCell } from '@vkontakte/vkui'
import React, { useEffect } from 'react'
import {
    useContractWrite,
    usePrepareContractWrite,
    usePrepareSendTransaction,
    useSendTransaction,
    useSignTypedData
} from 'wagmi'

import { BigNumber, ethers } from 'ethers'
import { Percent } from '@uniswap/sdk-core'
import { SwapOptions, SwapRouter } from '@uniswap/universal-router-sdk'
import { verifyTypedData } from 'ethers/lib/utils.js'
import { Permit2Permit } from '@uniswap/universal-router-sdk/dist/utils/permit2'
import { CustomRouter } from '../../logic/router'

import { encodePay } from '../../utils/customEncode'
import { ConfigPayment, ListToken, ListTokens, Payment, Permit2AllowanceType } from '../../logic/payment'
import { ETHToWei, weiToEthNum } from '../../logic/utils'

const UNIVERSAL_ROUTER = '0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5'

interface AllType {
    id: string,
    address: `0x${string}`,
    uuid: string,
    consoleLog: Function,
    setPayed: Function,
    setProgress: Function,
    tokenA: ListToken,
    tokenB: ListToken,
    fullListTokensUp: ListTokens,
    chainId: number,
    addressMerchant: string,
    amountOut: string | number

}

interface ProcessType {
    address: `0x${string}`,
    position: number,
    setPosition: Function,
    positionError: number,
    setPositionError: Function,
    uuid: string,
    consoleLog: Function,
    reRender: Function,
    setPayed: Function,
    setDataTr: Function,
    dataTr: string | undefined,
    feeData: ethers.providers.FeeData | undefined,
    payClass: Payment,
    tokenA: ListToken,
    tokenB: ListToken,
    fullListTokensUp: ListTokens
}

const ProcessOne: React.FC<ProcessType> = (props) => {
    const [ firstRender, setFirstRender ] = React.useState<boolean>(false)

    const { payClass } = props

    const { config } = usePrepareContractWrite(payClass?.ApproveSyncPermit())
    const { data, write, error } = useContractWrite(config)

    useEffect(() => { // check balance and allownce
        if (!firstRender && write && props.position === 0 && payClass) {
            payClass.getBalance('A').then((b) => {
                if (weiToEthNum(b, payClass.tokenA.info.decimals) < payClass.tokenA.info.amountIn) {
                    props.consoleLog('Not enough balance', false)
                    props.setPositionError(1)
                    return
                }
                payClass.checkAllowance('A', 'permit').then((amount) => {
                    if (weiToEthNum(amount, payClass.tokenA.info.decimals) < payClass.tokenA.info.amountIn) {
                        try {
                            write()
                        } catch (errorTry) {
                            props.consoleLog(errorTry ?? 'Unknown error', false)
                            props.setPositionError(1)
                        }
                        return
                    }
                    console.log('next')
                    props.setPosition(1)
                })
            })

            setFirstRender(true)
        }
    }, [ write ])

    useEffect(() => {
        if (data) {
            console.log('txHash approve', data)
            // data.wait(1).then(() => {
            setTimeout(() => {
                props.setPosition(1)
                props.reRender(2)
            }, 1000)

            // })
        }
    }, [ data ])

    useEffect(() => {
        if (error) {
            console.log('error: ', error)
            props.consoleLog(error?.message ?? 'Unknown error', false)
            props.setPositionError(1)
        }
    }, [ error ])

    return (
        <SimpleCell
            disabled={props.positionError !== 1}
            onClick={() => props.reRender(1)}
            style={props.position !== 0 ? { opacity: 0.5 } : {}}
            after={props.positionError === 1 ? <Icon28RefreshOutline /> : null}
            before={
                <div>
                    {props.positionError === 1 ? (
                        <Icon28CancelCircleOutline fill="var(--vkui--color_background_negative)" />
                    ) : null}
                    {props.position === 0 && props.positionError !== 1 ? (
                        <div className="process-spinner">
                            <Icon24Spinner width={28} height={28} />
                        </div>
                    ) : null}
                    {props.position > 0 && props.positionError !== 1 ? (
                        <Icon28CheckCircleOn fill="var(--vkui--color_background_positive--active)" />
                    ) : null}
                </div>
            }
        >
      Approve your tokens
        </SimpleCell>
    )
}

const ProcessTwo: React.FC<ProcessType> = (props: ProcessType) => {
    const [ firstRender, setFirstRender ] = React.useState<boolean>(false)

    const [ firstRender2, setFirstRender2 ] = React.useState<boolean>(false)

    const [ needToPermit, setNeedToPermit ] = React.useState<boolean>(false)

    const [ readyToSend, setReadyToSend ] = React.useState<boolean>(false)

    const [ noncePermit, setNoncePermit ] = React.useState<number>(0)

    const { payClass } = props

    const router = new CustomRouter(payClass?.networkId)
    // sign permit
    const dataFS = payClass.dataForSign(noncePermit)

    const sign = useSignTypedData({
        domain: dataFS.domain,
        types: dataFS.types,
        value: dataFS.value
    })

    useEffect(() => { // check allowance permit
        if (!firstRender && props.position === 1 && sign) {
            console.log('start sign')
            setFirstRender(true)

            payClass.AllowancePermit('A', 'router').then((allowance: Permit2AllowanceType | undefined) => {
                if (!allowance) {
                    setNeedToPermit(true)
                    return
                }

                if (weiToEthNum(allowance.amount, payClass.tokenA.info.decimals)
                < (payClass.tokenA.info.amountIn) || allowance.expiration < Date.now() / 1000) {
                    setNeedToPermit(true)
                    return
                }
                setNoncePermit(allowance.nonce)
                setReadyToSend(true)
            })
        }
    }, [ props.position, sign ])

    // sign error handler

    useEffect(() => {
        if (sign.isError) {
            props.setPositionError(2)
        }
    }, [ sign.isError ])

    useEffect(() => {
        if (needToPermit) sign.signTypedData()
    }, [ needToPermit ])

    useEffect(() => {
        console.log('sign.data', sign.data)
        if (sign.data || readyToSend) {
            if (sign.data) { // TODO
                const isv = verifyTypedData(dataFS.domain, dataFS.types, dataFS.value, sign.data)

                // console.log('sign.data', sign.data)

                console.log('address sign', isv)
            }

            const amountOut = ETHToWei(payClass.amountOut, props.tokenB.decimals)
            console.log('amountOut', amountOut)

            if (!firstRender2 && firstRender) {
                console.log('start pa')
                setFirstRender2(true)
                // data.wait(1).then(() => {
                router.getRouter(amountOut, props.payClass.tokenA.erc20, props.payClass.tokenB.erc20).then((path) => {
                    if (path) {
                        console.log('path 22', path)

                        const deadline = ~~(Date.now() / 1000) + 60 * 32

                        const valuesSign: any = dataFS.value
                        valuesSign.signature = sign.data

                        const permit2permit: Permit2Permit = valuesSign

                        console.log('start build params', permit2permit)

                        const swapOptions: SwapOptions = {
                            slippageTolerance: new Percent('90', '100'),
                            deadlineOrPreviousBlockhash: deadline.toString(),
                            recipient: payClass.addressRouter
                        }
                        if (needToPermit) swapOptions.inputTokenPermit = permit2permit

                        const { calldata, value } = SwapRouter.swapERC20CallParameters(
                            path.trade,
                            swapOptions
                        )

                        // const ser = router.builder.serialize()
                        // console.log(ser)

                        console.log('deadline', deadline)

                        console.log('value', value)

                        // const datatr = UniversalRouter.encodeExecute(ser.commands, ser.inputs, deadline)

                        // const datatr = UniversalRouter.encodeExecute(ser.commands, ser.inputs, deadline)

                        const encoded = encodePay({
                            amount: amountOut.toString(),
                            recipient: payClass.addressMerchant,
                            tokenAddress: props.payClass.tokenB.contract.address,
                            txData: calldata,
                            uiid: props.uuid
                        })

                        props.setDataTr(encoded)

                        props.setPosition(2)

                        props.reRender(3)
                    } else {
                        props.consoleLog('Error path', false)
                        props.setPositionError(1)
                    }
                })
                // })
            }

            // )
        }
    }, [ props.position, sign.data, readyToSend ])

    return (
        <SimpleCell
            disabled={props.positionError !== 2}
            onClick={() => props.reRender(2)}
            style={props.position !== 1 ? { opacity: 0.5 } : {}}
            after={props.positionError === 2 ? <Icon28RefreshOutline /> : null}
            before={
                <div>
                    {props.positionError === 2 ? (
                        <Icon28CancelCircleOutline fill="var(--vkui--color_background_negative)" />
                    ) : null}
                    {props.position < 1 && props.positionError !== 2 ? (
                        <Icon28CheckCircleOff />
                    ) : null}
                    {props.position === 1 && props.positionError !== 2 ? (
                        <div className="process-spinner">
                            <Icon24Spinner width={28} height={28} />
                        </div>
                    ) : null}
                    {props.position > 1 && props.positionError !== 2 ? (
                        <Icon28CheckCircleOn fill="var(--vkui--color_background_positive--active)" />
                    ) : null}
                </div>
            }
        >
      Sign your tokens
        </SimpleCell>
    )
}

const ProcessThree: React.FC<ProcessType> = (props: ProcessType) => {
    const [ firstRender, setFirstRender ] = React.useState<boolean>(false)

    const { config } = usePrepareSendTransaction({
        request: {
            to: props.payClass.addressRouter, // NOTE: custom_contract
            // to: '0xC1dE05611B3C8cA7a8C6CC265fAA97DD12F14ABf',
            data: props.dataTr,
            value: BigNumber.from('0')
        }
    })
    const { data, isLoading, isSuccess, sendTransaction, error } = useSendTransaction(config)

    useEffect(() => {
    // console.log('start tr', props.position, props.dataTr, sendTransaction)
        if (
            !firstRender
      && props.position === 2
      && sendTransaction
      && props.dataTr
        ) {
            setFirstRender(true)

            console.log('props.dataTr', props.dataTr)
            setTimeout(() => {
                sendTransaction()
            }, 1000)
        }
    }, [ props.position, props.dataTr, sendTransaction ])

    useEffect(() => {
        if (props.dataTr) {
            console.log('props.dataTr 2', props.dataTr)
            props.reRender(3)
        }
    }, [ props.dataTr ])

    useEffect(() => {
        if (data) {
            console.log('txHash transfer', data)
            data.wait(1).then(() => {
                props.setPosition(3)

                props.setPayed(true)
            })
        }
    }, [ data ])

    useEffect(() => {
        if (error) {
            console.log('error: ', error)
            props.consoleLog(error?.message ?? 'Unknown error', false)
            props.setPositionError(3)
        }
    }, [ error ])

    return (
        <SimpleCell
            disabled={props.positionError !== 2}
            onClick={() => props.reRender(2)}
            style={props.position !== 2 ? { opacity: 0.5 } : {}}
            after={props.positionError === 3 ? <Icon28RefreshOutline /> : null}
            before={
                <div>
                    {props.positionError === 3 ? (
                        <Icon28CancelCircleOutline fill="var(--vkui--color_background_negative)" />
                    ) : null}
                    {props.position < 2 && props.positionError !== 3 ? (
                        <Icon28CheckCircleOff />
                    ) : null}
                    {props.position === 2 && props.positionError !== 3 ? (
                        <div className="process-spinner">
                            <Icon24Spinner width={28} height={28} />
                        </div>
                    ) : null}
                    {props.position > 2 && props.positionError !== 3 ? (
                        <Icon28CheckCircleOn fill="var(--vkui--color_background_positive--active)" />
                    ) : null}
                </div>
            }
        >
      Sign transaction
        </SimpleCell>
    )
}

export const ProcessAll: React.FC<AllType> = (props: AllType) => {
    const [ firstRender, setFirstRender ] = React.useState<boolean>(false)

    const [ position, setPosition ] = React.useState<number>(0)
    const [ positionError, setPositionError ] = React.useState<number>(0)

    const [ oneId, setOneId ] = React.useState<string>('100')
    const [ twoId, setTwoId ] = React.useState<string>('200')
    const [ treId, setTreId ] = React.useState<string>('300')

    const [ dataTr, setDataTr ] = React.useState<string | undefined>(undefined)

    const [ feeData, setFeeData ] = React.useState<
    ethers.providers.FeeData | undefined
    >(undefined)

    const config: ConfigPayment = {
        networkId: props.chainId,
        tokenA: props.tokenA,
        tokenB: props.tokenB,
        addressUser: props.address,
        addressMerchant: props.addressMerchant,
        amountOut: props.amountOut.toString(),
        callback: props.consoleLog
    }

    const [ payClass, setPayClass ] = React.useState<Payment>(new Payment(config))

    function reRender (id: number) {
        if (id === 1) {
            setOneId(`${Number(oneId) + 1}`)
        }
        if (id === 2) {
            setTwoId(`${Number(twoId) + 1}`)
        }
        if (id === 3) {
            setTreId(`${Number(twoId) + 1}`)
        }
        setPositionError(0)
    }

    useEffect(() => {
        if (!firstRender) {
            setFirstRender(true)

            payClass.getFee().then((fee) => {
                setFeeData(fee)
            })
        }
    }, [])

    useEffect(() => {
        if (position === 0) {
            props.setProgress(50)
        }
        if (position === 1) {
            props.setProgress(75)
        }
        if (position === 2) {
            props.setProgress(100)
        }
    }, [ position ])

    return (
        <div id={props.id} className="process-block">
            <ProcessOne
                key={oneId}
                address={props.address}
                setPosition={setPosition}
                position={position}
                positionError={positionError}
                setPositionError={setPositionError}
                uuid={props.uuid}
                consoleLog={props.consoleLog}
                reRender={reRender}
                setPayed={props.setPayed}
                setDataTr={setDataTr}
                dataTr={dataTr}
                feeData={feeData}
                payClass={payClass}
                tokenA={props.tokenA}
                tokenB={props.tokenB}
                fullListTokensUp={props.fullListTokensUp}
            />
            <ProcessTwo
                key={twoId}
                address={props.address}
                setPosition={setPosition}
                position={position}
                positionError={positionError}
                setPositionError={setPositionError}
                uuid={props.uuid}
                consoleLog={props.consoleLog}
                reRender={reRender}
                setPayed={props.setPayed}
                setDataTr={setDataTr}
                dataTr={dataTr}
                feeData={feeData}
                payClass={payClass}
                tokenA={props.tokenA}
                tokenB={props.tokenB}
                fullListTokensUp={props.fullListTokensUp}
            />
            <ProcessThree
                key={treId}
                address={props.address}
                setPosition={setPosition}
                position={position}
                positionError={positionError}
                setPositionError={setPositionError}
                uuid={props.uuid}
                consoleLog={props.consoleLog}
                reRender={reRender}
                setPayed={props.setPayed}
                setDataTr={setDataTr}
                dataTr={dataTr}
                feeData={feeData}
                payClass={payClass}
                tokenA={props.tokenA}
                tokenB={props.tokenB}
                fullListTokensUp={props.fullListTokensUp}
            />
        </div>
    )
}
