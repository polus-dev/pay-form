import {
    Icon24Spinner,
    Icon28CancelCircleOutline,
    Icon28CheckCircleOff, Icon28CheckCircleOn,
    Icon28RefreshOutline
} from '@vkontakte/icons'
import { IconButton, SimpleCell } from '@vkontakte/vkui'
import React, { useEffect } from 'react'
import { UseContractWriteConfig, UsePrepareContractWriteConfig, useContractRead, useContractWrite, usePrepareContractWrite, usePrepareSendTransaction, useSendTransaction, useSignTypedData } from 'wagmi'

import { JsonRpcProvider as Provider } from '@ethersproject/providers'
import JSBI from 'jsbi'

import { BigNumber, ethers } from 'ethers'
import { AlphaRouter, CurrencyAmount } from '@uniswap/smart-order-router'
import { Token, BigintIsh, TradeType } from '@uniswap/sdk-core'
import polus_abi from '../../polus_abi.json'
import token_abi from '../../token_abi.json'
import router_abi from '../../router_abi.json'
import { CustomRouter } from '../../logic/router'
import { Address, Uint } from '../../logic/uwm/types'
import { UniversalRouter } from '../../logic/uwm/router'

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
    setProgress: Function
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
    dataTr: string | undefined
}

const token0 = {
    chainId: 137,
    decimals: 18,
    symbol: 'ELON',
    name: 'elon',
    isNative: false,
    isToken: true,
    address: '0xE0339c80fFDE91F3e20494Df88d4206D86024cdF'
}

const token1 = {
    chainId: 137,
    decimals: 18,
    symbol: 'DAI',
    name: 'dai',
    isNative: false,
    isToken: true,
    address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063'
}

function pack (
    address: string,
    amount: string,
    expiration: string,
    nonce: string,
    spender: string,
    sigDeadline: string) {
    const string = address.replace('0x', '')
    + amount.replace('0x', '')
    + expiration.replace('0x', '')
    + nonce.replace('0x', '')
    + spender.replace('0x', '')
    + sigDeadline.replace('0x', '')
    return string
}

function toToken (address: string) {
    return new Token(
        137,
        address,
        18,
        'test',
        'test'
    )
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
                if (Number(contractRead.data) < 1000000000) { // TODO
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
            props.setPosition(1)
            props.reRender(2)
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

    const router = new CustomRouter()

    const tokenA = router.addressToToken(props.tokenAddress, 0)
    const tokenB = router.addressToToken(props.currentAddressToken, 0)

    const dataForSign = CustomRouter.packToWagmi(
        props.tokenAddress,
        (2n ** 160n - 1n).toString(),
        (2n ** 48n - 1n).toString(),
        (0).toString(),
        props.universalRouter,
        BigInt(~~(Date.now() / 1000) + 60 * 30).toString()
    )

    // console.log(dataForSign)

    const sign = useSignTypedData({
        domain: {},
        types: dataForSign.types,
        value: dataForSign.value
    })

    useEffect(() => {
        if (!firstRender && props.position === 1 && sign) {
            console.log('start sign')
            setFirstRender(true)
            sign.signTypedData()
        }
    }, [ props.position, sign ])

    useEffect(() => {
        console.log(sign.data)
        console.log(sign.variables)
        if (sign.data) {
            router.packSignToWagmi(
                props.tokenAddress,
                props.universalRouter,
                sign.data
            )

            router.getRouter(props.amount, tokenA, tokenB).then((path) => {
                if (path) {
                    console.log(path)

                    const encodedPath = CustomRouter.encodePath(path)

                    console.log(encodedPath)

                    router.packSwapWagmi(
                        '0xb7a9A25D776200cE9dF88117b573d198Dc46b92B',
                        BigInt(props.amount),
                        2n ** 10n - 1n,
                        encodedPath
                    )

                    const ser = router.builder.serialize()
                    console.log(ser)

                    const deadline = ~~(Date.now() / 1000) + 60 * 32

                    const datatr = UniversalRouter.encodeExecute(ser.commands, ser.inputs, deadline)

                    console.log('datatr', datatr)

                    props.setDataTr(datatr)

                    props.setPosition(2)
                }
            }).catch((err) => {
                console.error(err)
            })

            // [0x0000000000000000000000008f3cf7ad23cd3cadbd9735aff958023239c6a063000000000000000000000000ffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000ffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000004c60051384bd2d3c01bfc845cf5f4b44bcbe9de500000000000000000000000000000000000000000000000000000000640bbe7c00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000041c75201e37e37f2e28e6a1d721c567c6be3fc5d87c6a4dd7a7dcd3bf9aa6b025c6a6f07e991e2b26f915a160e4e01c89957b8f03ed177bd0ca17e32fcd5cb1e3a1c00000000000000000000000000000000000000000000000000000000000000,0x000000000000000000000000b7a9a25d776200ce9df88117b573d198dc46b92b00000000000000000000000000000000000000000000000000000000000185e000000000000000000000000000000000000000000000000000000000000003ff00000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000042e0339c80ffde91f3e20494df88d4206d86024cdf0027100d500b1d8e8ef31e21c99d1db9a6444d3adf1270000bb88f3cf7ad23cd3cadbd9735aff958023239c6a063000000000000000000000000000000000000000000000000000000000000]
            // router.packSwapWagmi(

            // )
        }
    }, [ sign.data ])

    return (
        <SimpleCell
            disabled={props.positionError !== 2}
            onClick={() => props.reRender(1)}
            style={props.position !== 1 ? { opacity: 0.5 } : {}}
            after={props.positionError === 2 ? <Icon28RefreshOutline /> : null}
            before={
                <div>
                    {props.positionError === 2
                        ? <Icon28CancelCircleOutline fill="var(--vkui--color_background_negative)" /> : null }
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
    const { data, isLoading, isSuccess, sendTransaction } = useSendTransaction(config)

    useEffect(() => {
        if (!firstRender && props.position === 2 && sendTransaction && props.dataTr) {
            setFirstRender(true)

            console.log('props.dataTr', props.dataTr)
            sendTransaction()
        }
    }, [ props.position, props.dataTr ])

    useEffect(() => {
        if (props.dataTr) {
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
            })
        }
    }, [ data ])

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

    const tokenAddressFrom = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    const tokenAddressTo = '0x6B175474E89094C44Da98b954EedeAC495271d0F'

    const universalRouter = '0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B'

    const addressPermit = '0x000000000022d473030f116ddee9f6b43ac78ba3'

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
                tokenAddress={tokenAddressFrom}
                setPosition={setPosition}
                position={position}
                positionError={positionError}
                setPositionError={setPositionError}
                amount={props.amount}
                addressMerchant={props.addressMerchant}
                uuid={props.uuid}
                currentAddressToken={tokenAddressTo}
                consoleLog={props.consoleLog}
                reRender={reRender}
                setPayed={props.setPayed}
                universalRouter={universalRouter}
                setDataTr={setDataTr}
                dataTr={dataTr}
            />
            <ProcessTwo
                key={twoId}
                address={props.address}
                addressPolus={addressPermit}
                tokenAddress={tokenAddressFrom}
                setPosition={setPosition}
                position={position}
                positionError={positionError}
                setPositionError={setPositionError}
                amount={props.amount}
                addressMerchant={props.addressMerchant}
                uuid={props.uuid}
                currentAddressToken={tokenAddressTo}
                consoleLog={props.consoleLog}
                reRender={reRender}
                setPayed={props.setPayed}
                universalRouter={universalRouter}
                setDataTr={setDataTr}
                dataTr={dataTr}
            />
            <ProcessThree
                key={treId}
                address={props.address}
                addressPolus={addressPermit}
                tokenAddress={tokenAddressFrom}
                setPosition={setPosition}
                position={position}
                positionError={positionError}
                setPositionError={setPositionError}
                amount={props.amount}
                addressMerchant={props.addressMerchant}
                uuid={props.uuid}
                currentAddressToken={tokenAddressTo}
                consoleLog={props.consoleLog}
                reRender={reRender}
                setPayed={props.setPayed}
                universalRouter={universalRouter}
                setDataTr={setDataTr}
                dataTr={dataTr}
            />

        </div>
    )
}
