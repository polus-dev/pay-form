import {
    Icon24Spinner,
    Icon28CancelCircleOutline,
    Icon28CheckCircleOff, Icon28CheckCircleOn,
    Icon28RefreshOutline
} from '@vkontakte/icons'
import { IconButton, SimpleCell } from '@vkontakte/vkui'
import React, { useEffect } from 'react'
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'

import { ethers } from 'ethers'
import polus_abi from '../../polus_abi.json'
import token_abi from '../../token_abi.json'

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
    setPayed: Function
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
    setPayed: Function
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
        if (!firstRender && write && props.position === 0) {
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
                        ? <Icon28CancelCircleOutline fill="var(--dynamic_red)" /> : null }
                    {props.position === 0 && props.positionError !== 1
                        ? <div className="process-spinner">
                            <Icon24Spinner width={28} height={28} />
                        </div> : null}
                    {props.position > 0 && props.positionError !== 1
                        ? <Icon28CheckCircleOn fill="var(--button_commerce_background)" /> : null}
                </div>
            }
        >
    Approve your tokens</SimpleCell>
    )
}

const ProcessTwo: React.FC<ProcessType> = (props: ProcessType) => {
    const [ firstRender, setFirstRender ] = React.useState<boolean>(false)

    const addr: `0x${string}` = `0x${props.addressPolus.replace('0x', '')}`
    const addrToken: `0x${string}` = `0x${props.tokenAddress.replace('0x', '')}`

    const balanceUser = useContractRead({
        address: addrToken,
        abi: token_abi,
        functionName: 'balanceOf',
        args: [ props.address ]
    })

    const configPay = props.tokenAddress === props.currentAddressToken ? usePrepareContractWrite({
        address: addr,
        abi: polus_abi.abi,
        functionName: 'swapEqualInOutToken',
        args: [ props.tokenAddress, props.addressMerchant, props.amount, `0x${props.uuid}` ]
    }) : usePrepareContractWrite({
        address: addr,
        abi: polus_abi.abi,
        functionName: 'swapExactInputSingleHop',
        args: [
            props.tokenAddress,
            props.currentAddressToken,
            props.addressMerchant,
            props.amount,
            `0x${props.uuid}`,
            3000 // fee ??
        ]
    })

    const trans = useContractWrite(configPay.config)

    useEffect(() => {
        console.log('props.position', props.position)
        if (!firstRender && trans.write && props.position === 1) {
            setFirstRender(true)

            trans.write()
        }
        balanceUser.refetch()
    }, [ trans.write, props.position ])

    useEffect(() => {
        if (trans.data) {
            console.log('txHash transfer', trans.data)
            trans.data.wait(1).then(() => {
                props.setPosition(2)

                props.setPayed(true)
            })
        }
    }, [ trans.data ])

    useEffect(() => {
        if (trans.error) {
            // console.log('error: ', error)
            props.consoleLog(trans.error?.message ?? 'Unknown error', false)
            props.setPositionError(2)
        }
        console.log(trans.error)
    }, [ trans.error ])

    useEffect(() => {
        if (balanceUser.data && props.position === 1) {
            console.log('balanceOf', balanceUser.data)
            if (balanceUser.data < props.amount) {
                props.consoleLog('Amount exceeds', false)
                props.setPositionError(2)
            }
        }
    }, [ balanceUser.data, balanceUser.fetchStatus ])

    useEffect(() => {
        console.log('render')
    }, [ ])

    return (
        <SimpleCell
            disabled={props.positionError !== 2}
            onClick={() => props.reRender(2)}

            style={props.position !== 1 ? { opacity: 0.5 } : {}}
            after={props.positionError === 2 ? <Icon28RefreshOutline /> : null}
            before={
                <div>
                    {props.positionError === 2 ? <Icon28CancelCircleOutline fill="var(--dynamic_red)"/> : null }
                    {props.position < 1 && props.positionError !== 2
                        ? <Icon28CheckCircleOff /> : null}
                    {props.position === 1 && props.positionError !== 2
                        ? <div className="process-spinner">
                            <Icon24Spinner width={28} height={28} />
                        </div> : null}
                    {props.position > 1 && props.positionError !== 2
                        ? <Icon28CheckCircleOn fill="var(--button_commerce_background)" /> : null}
                </div>
            }
        >
    Sign transaction</SimpleCell>
    )
}

const ProcessTree: React.FC<ProcessType> = (props: ProcessType) => {
    const [ firstRender, setFirstRender ] = React.useState<boolean>(false)

    useEffect(() => {
        if (!firstRender) {
            setFirstRender(true)
        }
    }, [])

    return (
        <SimpleCell
            disabled
            style={props.position !== 2 ? { opacity: 0.5, marginBottom: '24px' } : { marginBottom: '24px' }}
            before={
                <div>
                    {props.position < 2 ? <Icon28CheckCircleOff /> : null}
                    {props.position === 2 ? <Icon28CheckCircleOn fill="var(--button_commerce_background)" /> : null}
                </div>
            }
        >
    Payment successfull</SimpleCell>
    )
}

export const ProcessAll: React.FC<AllType> = (props: AllType) => {
    const [ firstRender, setFirstRender ] = React.useState<boolean>(false)

    const [ position, setPosition ] = React.useState<number>(0)
    const [ positionError, setPositionError ] = React.useState<number>(0)

    const [ oneId, setOneId ] = React.useState<string>('100')
    const [ twoId, setTwoId ] = React.useState<string>('200')

    function reRender (id: number) {
        if (id === 1) {
            setOneId(`${Number(oneId) + 1}`)
        }
        if (id === 2) {
            setTwoId(`${Number(twoId) + 1}`)
        }
        setPositionError(0)
    }

    useEffect(() => {
        if (!firstRender) {
            setFirstRender(true)
        }
    }, [])

    return (
        <div id={props.id} className="process-block">
            <ProcessOne
                key={oneId}
                address={props.address}
                addressPolus={props.addressPolus}
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
            />
            <ProcessTwo
                key={twoId}
                address={props.address}
                addressPolus={props.addressPolus}
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
            />
            <ProcessTree
                key={'tree1'}
                address={props.address}
                addressPolus={props.addressPolus}
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
            />
        </div>
    )
}
