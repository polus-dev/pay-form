import {
    Icon24Spinner,
    Icon28CancelCircleOutline,
    Icon28CheckCircleOff, Icon28CheckCircleOn,
    Icon28RefreshOutline
} from '@vkontakte/icons'
import { SimpleCell } from '@vkontakte/vkui'
import React, { useEffect } from 'react'
import { useContractRead, useContractWrite, usePrepareContractWrite, usePrepareSendTransaction, useSendTransaction } from 'wagmi'

import { BigNumber, ethers } from 'ethers'
import { Percent } from '@uniswap/sdk-core'
import { SwapRouter } from '@uniswap/universal-router-sdk'
import token_abi from '../../token_abi.json'
import { CustomRouter } from '../../logic/router'

import permit2 from '../../permit.json'
import { tokens } from '../../logic/tokens'

const PERMIT2_ADDRESS = '0x000000000022d473030f116ddee9f6b43ac78ba3'
const UNIVERSAL_ROUTER = '0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5'

interface AllType {
    id: string,
    tokenAddress: string,
    addressPolus: string,
    address: `0x${string}`,
    amount: string,
    addressMerchant: string,
    currentAddressToken: string,
    uuid: string,
    consoleLog: Function,
    setPayed: Function,
    setProgress: Function,
    chainId: number,
    amountOut: string
}

interface ProcessType {
    address: `0x${string}`,
    tokenAddress: string,
    addressPolus: string,
    position: number,
    setPosition: Function,
    positionError: number,
    setPositionError: Function,
    amount: string,
    addressMerchant: string,
    uuid: string,
    currentAddressToken: string,
    consoleLog: Function,
    reRender: Function,
    setPayed: Function,
    universalRouter: string,
    setDataTr: Function,
    dataTr: string | undefined,
    chainId: number,
    amountOut: string,
    feeData: ethers.providers.FeeData | undefined
}

const ProcessOne: React.FC<ProcessType> = (props: ProcessType) => {
    const [ firstRender, setFirstRender ] = React.useState<boolean>(false)

    const addr: `0x${string}` = `0x${props.tokenAddress.replace('0x', '')}`
    const contractRead = useContractRead({
        address: addr,
        abi: token_abi,
        functionName: 'allowance',
        args: [ props.address, props.addressPolus ]
    })

    const { config } = usePrepareContractWrite({
        address: addr,
        abi: token_abi,
        functionName: 'approve',
        args: [ props.addressPolus, ethers.constants.MaxUint256 ]
    })
    const { data, write, error } = useContractWrite(config)

    useEffect(() => {
        if (!firstRender && write && props.position === 0 && contractRead.data) {
            setFirstRender(true)
            console.log('amount isApprove', contractRead.data)
            if (contractRead.data) {
                if (BigInt(contractRead.data.toString()) < BigInt(props.amount)) { // TODO
                    try {
                        write()
                    } catch (errorTry) {
                        props.consoleLog(errorTry ?? 'Unknown error', false)
                        props.setPositionError(1)
                    }
                } else {
                    console.log('next')
                    props.setPosition(1)
                }
            } else {
                console.log('addr', addr)
                console.log('props.address', props.address)
                console.log('props.addressPolus', props.addressPolus)
            }
        }
    }, [ contractRead.data, write ])

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
                    {props.positionError === 1
                        ? <Icon28CancelCircleOutline fill="var(--vkui--color_background_negative)" /> : null }
                    {props.position === 0 && props.positionError !== 1
                        ? <div className="process-spinner">
                            <Icon24Spinner width={28} height={28} />
                        </div> : null}
                    {props.position > 0 && props.positionError !== 1
                        ? <Icon28CheckCircleOn fill="var(--vkui--color_background_positive--active)" /> : null}
                </div>
            }
        >
    Approve your tokens</SimpleCell>
    )
}

const ProcessTwo: React.FC<ProcessType> = (props: ProcessType) => {
    const [ firstRender, setFirstRender ] = React.useState<boolean>(false)

    const [ firstRender2, setFirstRender2 ] = React.useState<boolean>(false)

    // const dataForSign = router.packPermitSingleData(
    //     new Address(props.tokenAddress),
    //     new Uint(ethers.constants.MaxUint256.toBigInt()),
    //     new Uint(2n ** 48n - 1n),
    //     new Uint(0n),
    //     new Address(props.universalRouter),
    //     new Uint(
    //         BigInt(~~(Date.now() / 1000) + 60 * 30)
    //     )
    // )
    const { config } = usePrepareContractWrite({
        address: PERMIT2_ADDRESS,
        abi: permit2,
        functionName: 'approve',
        args: [
            props.tokenAddress,
            props.universalRouter,
            (2n ** 160n - 1n).toString(),
            BigInt(~~(Date.now() / 1000) + 60 * 60 * 24 * 30).toString()
        ],
        overrides: props.feeData ? {
            maxFeePerGas: BigNumber.from(
                (
                    props.feeData.maxFeePerGas ? (props.feeData.maxFeePerGas.toNumber() * 1.01) : 0
                ).toFixed(0)
            ),
            maxPriorityFeePerGas: BigNumber.from(
                (
                    props.feeData.maxPriorityFeePerGas ? (props.feeData.maxPriorityFeePerGas.toNumber() * 40) : 0
                ).toFixed(0)
            )
            // gasPrice: BigNumber.from(
            //     (
            //         props.feeData.gasPrice ? (props.feeData.gasPrice.toNumber() * 1.1) : 0
            //     ).toFixed(0)
            // )
        } : undefined
    })
    const { data, write, error } = useContractWrite(config)

    const router = new CustomRouter(props.chainId)

    const tokenA = router.addressToToken(props.tokenAddress, 0)
    const tokenB = router.addressToToken(props.currentAddressToken, 0)

    // const dataForSign = CustomRouter.packToWagmi(
    //     props.tokenAddress,
    //     (2n ** 160n - 1n).toString(),
    //     BigInt(~~(Date.now() / 1000) + 60 * 60 * 24 * 30).toString(),
    //     (0).toString(),
    //     props.universalRouter,
    //     BigInt(~~(Date.now() / 1000) + 60 * 30).toString()
    // )

    // console.log(dataForSign)

    // const valuesAny: PermitSingle = dataForSign.value

    // const { domain, types, values } = AllowanceTransfer.getPermitData(valuesAny, PERMIT2_ADDRESS, 137)

    // console.log('domain', domain)
    // console.log('types', types)
    // console.log('values', values)

    // const dd: any = domain
    // const tt: any = types
    // const vv: any = values

    // const sign = useSignTypedData({
    //     domain: dd,
    //     types: tt,
    //     value: vv
    // })

    useEffect(() => {
        if (!firstRender && props.position === 1 && write) {
            // console.log('start sign')
            setFirstRender(true)
            // sign.signTypedData()

            write()
        }
    }, [ props.position, write ])

    useEffect(() => {
        // console.log('sign.data', sign.data)
        // console.log('sign.variables', sign.variables)
        // if (sign.data && data) {
        // router.packSignToWagmi2(
        //     dataForSign.value,
        //     sign.data
        // )

        // const isv = verifyTypedData(
        //     {},
        //     dataForSign.types,
        //     valuesAny,
        //     sign.data
        // )

        // console.log(isv)

        let curentTokenDecimals = 8

        if (props.chainId === 137) {
            curentTokenDecimals = tokens.polygon.filter(t => t.address === tokenB.address)[0].nano
        } else {
            curentTokenDecimals = tokens.mainnet.filter(t => t.address === tokenB.address)[0].nano
        }
        tokens

        const amountOut = ethers.utils.parseUnits(props.amountOut, curentTokenDecimals)
        console.log('amountOut', amountOut)

        if (!firstRender2 && firstRender) {
            console.log('start pa')
            setFirstRender2(true)
            // data.wait(1).then(() => {
            router.getRouter(amountOut, tokenA, tokenB).then((path) => {
                if (path) {
                    console.log('path', path)

                    // const encodedPath = CustomRouter.encodePath(path)

                    // console.log()
                    

                    // const { pools } = path.trade.swaps[0].route

                    // const pool = pools[0] as Pool

                    // const curr1 = path.trade.swaps[0].inputAmount.currency

                    // const curr2 = path.trade.swaps[0].outputAmount.currency

                    // const ss = new Route([ pool ],
                    //     curr1,
                    //     curr2)

                    // const encodedP = encodeRouteToPath(ss, true)

                    // console.log('encodedP', encodedP)

                    // router.packSwapWagmi(
                    //     '0x0F652b340596e702912eAAccD1093871aFDB49c7',
                    //     BigInt(amountOut),
                    //     (1n * 10n ** 18n) + (1n * 10n ** 15n),
                    //     encodedP
                    // )

                    const deadline = ~~(Date.now() / 1000) + 60 * 32

                    // const valuesSign: any = values
                    // valuesSign.signature = sign.data

                    // const permit2permit: Permit2Permit = valuesSign

                    const { calldata: data2, value } = SwapRouter.swapERC20CallParameters(path.trade, {
                        slippageTolerance: new Percent('90', '100'),
                        deadlineOrPreviousBlockhash: deadline.toString(),
                        recipient: props.addressMerchant
                        // inputTokenPermit: permit2permit
                    })

                    // const ser = router.builder.serialize()
                    // console.log(ser)

                    console.log('deadline', deadline)

                    console.log('value', value)

                    // const datatr = UniversalRouter.encodeExecute(ser.commands, ser.inputs, deadline)

                    // const datatr = UniversalRouter.encodeExecute(ser.commands, ser.inputs, deadline)

                    console.log('datatr', data2)

                    props.setDataTr(data2)

                    props.setPosition(2)

                    props.reRender(3)
                } else {
                    props.consoleLog('Error path', false)
                    props.setPositionError(1)
                }
            }).catch((err) => {
                if (error) {
                    console.log('error: ', error)
                    props.consoleLog(err ?? 'Unknown error', false)
                    props.setPositionError(1)
                }
            })
            // })
        }

        // )
        // }
    }, [ data, props.position ])

    useEffect(() => {
        if (error) {
            console.log('error: ', error)
            props.consoleLog(error?.message ?? 'Unknown error', false)
            props.setPositionError(2)
        }
    }, [ error ])

    return (
        <SimpleCell
            disabled={props.positionError !== 2}
            onClick={() => props.reRender(2)}
            style={props.position !== 1 ? { opacity: 0.5 } : {}}
            after={props.positionError === 2 ? <Icon28RefreshOutline /> : null}
            before={
                <div>
                    {props.positionError === 2
                        ? <Icon28CancelCircleOutline fill="var(--vkui--color_background_negative)" /> : null }
                    {props.position < 1 && props.positionError !== 2
                        ? <Icon28CheckCircleOff /> : null}
                    {props.position === 1 && props.positionError !== 2
                        ? <div className="process-spinner">
                            <Icon24Spinner width={28} height={28} />
                        </div> : null}
                    {props.position > 1 && props.positionError !== 2
                        ? <Icon28CheckCircleOn fill="var(--vkui--color_background_positive--active)" /> : null}
                </div>
            }
        >
    Sign your tokens</SimpleCell>
    )
}

const ProcessThree: React.FC<ProcessType> = (props: ProcessType) => {
    const [ firstRender, setFirstRender ] = React.useState<boolean>(false)

    const { config } = usePrepareSendTransaction({
        request: {
            to: props.universalRouter,
            data: props.dataTr,
            value: BigNumber.from('0')
        }
    })
    const { data, isLoading, isSuccess, sendTransaction, error } = useSendTransaction(config)

    useEffect(() => {
        // console.log('start tr', props.position, props.dataTr, sendTransaction)
        if (!firstRender && props.position === 2 && sendTransaction && props.dataTr) {
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

    // useEffect(() => {
    //     if (path && trans.write && !firstRender2) {
    //         setFirstRender2(true)
    //         console.log('write')
    //         trans.write()
    //     }
    // }, [ path, trans.write ])

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
                    {props.positionError === 3 ? <Icon28CancelCircleOutline
                        fill="var(--vkui--color_background_negative)"/> : null }
                    {props.position < 2 && props.positionError !== 3
                        ? <Icon28CheckCircleOff /> : null}
                    {props.position === 2 && props.positionError !== 3
                        ? <div className="process-spinner">
                            <Icon24Spinner width={28} height={28} />
                        </div> : null}
                    {props.position > 2 && props.positionError !== 3
                        ? <Icon28CheckCircleOn fill="var(--vkui--color_background_positive--active)" /> : null}
                </div>
            }
        >
    Sign transaction</SimpleCell>
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

    const [ feeData, setFeeData ] = React.useState<ethers.providers.FeeData | undefined>(undefined)

    // const tokenAddressFrom = '0xE0339c80fFDE91F3e20494Df88d4206D86024cdF'
    // const tokenAddressTo = '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063'

    // const tokenAddressFrom = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' // dai
    // const tokenAddressTo = '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063' // usdc

    const universalRouter = UNIVERSAL_ROUTER

    const addressPermit = PERMIT2_ADDRESS

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

    const provider = new ethers.providers.JsonRpcProvider(
        props.chainId === 137 ? 'https://side-dawn-sea.matic.quiknode.pro/ce9f1f0946472d034b646717ed6b29a175b85dba'
            : 'https://bitter-empty-energy.quiknode.pro/e49a9bbc66c87c52f9d677d0f96e667f0c2bc300/')

    useEffect(() => {
        if (!firstRender) {
            setFirstRender(true)

            provider.getFeeData().then((value) => {
                setFeeData(value)
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
                addressPolus={addressPermit}
                tokenAddress={props.tokenAddress}
                setPosition={setPosition}
                position={position}
                positionError={positionError}
                setPositionError={setPositionError}
                amount={props.amount}
                addressMerchant={props.addressMerchant}
                uuid={props.uuid}
                currentAddressToken={props.currentAddressToken}
                consoleLog={props.consoleLog}
                reRender={reRender}
                setPayed={props.setPayed}
                universalRouter={universalRouter}
                setDataTr={setDataTr}
                dataTr={dataTr}
                chainId={props.chainId}
                amountOut={props.amountOut}
                feeData={feeData}
            />
            <ProcessTwo
                key={twoId}
                address={props.address}
                addressPolus={addressPermit}
                tokenAddress={props.tokenAddress}
                setPosition={setPosition}
                position={position}
                positionError={positionError}
                setPositionError={setPositionError}
                amount={props.amount}
                addressMerchant={props.addressMerchant}
                uuid={props.uuid}
                currentAddressToken={props.currentAddressToken}
                consoleLog={props.consoleLog}
                reRender={reRender}
                setPayed={props.setPayed}
                universalRouter={universalRouter}
                setDataTr={setDataTr}
                dataTr={dataTr}
                chainId={props.chainId}
                amountOut={props.amountOut}
                feeData={feeData}
            />
            <ProcessThree
                key={treId}
                address={props.address}
                addressPolus={addressPermit}
                tokenAddress={props.tokenAddress}
                setPosition={setPosition}
                position={position}
                positionError={positionError}
                setPositionError={setPositionError}
                amount={props.amount}
                addressMerchant={props.addressMerchant}
                uuid={props.uuid}
                currentAddressToken={props.currentAddressToken}
                consoleLog={props.consoleLog}
                reRender={reRender}
                setPayed={props.setPayed}
                universalRouter={universalRouter}
                setDataTr={setDataTr}
                dataTr={dataTr}
                chainId={props.chainId}
                amountOut={props.amountOut}
                feeData={feeData}
            />

        </div>
    )
}
