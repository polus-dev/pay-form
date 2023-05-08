
import { doPayThroughPolusContract } from "../../../../logic/transactionEncode/doPayThroughPolusContract"
import { FC, memo, useEffect, useState } from "react"
import {
  usePrepareSendTransaction, useSendTransaction,
} from 'wagmi'

import { SimpleCell } from "@vkontakte/vkui"
import { Icon24Spinner, Icon28CancelCircleOutline, Icon28CheckCircleOff, Icon28CheckCircleOn, Icon28RefreshOutline } from "@vkontakte/icons"
import { ProcessType } from "../ProcessType"

import { ethers } from "ethers"
export const Stage2: FC<ProcessType> = memo(props => {
  const [firstRender, setFirstRender] = useState(false)

  const [time, setTime] = useState(false)



  const configForTransaction: Parameters<typeof usePrepareSendTransaction>[0] = { request: { to: props.addressPolus } }

  if (props.isNativeToNative) {
    configForTransaction!.request!.value = ethers.utils.parseEther(props.amount)
    configForTransaction!.request!.data = doPayThroughPolusContract({
      uuid: props.uuid.replaceAll("-", ""),
      fee: props.fee,
      merchant: props.addressMerchant,
      merchantAmount: props.asset_amount_decimals_without_fee,
      feeRecipient: props.feeRecipient
    })
  } else {
    configForTransaction!.request!.data = doPayThroughPolusContract({
      uuid: props.uuid.replaceAll("-", ""),
      fee: props.fee,
      merchant: props.addressMerchant,
      merchantAmount: props.asset_amount_decimals_without_fee,
      tokenAddress: props.tokenAddress,
      feeRecipient: props.feeRecipient,
    })
  }


  const { config } = usePrepareSendTransaction(configForTransaction)
  const { data, isLoading, isSuccess, sendTransaction, error, isError } =
    useSendTransaction(config)

  useEffect(() => {
    if (!firstRender && props.position === 1 && sendTransaction) {
      setFirstRender(true)
      sendTransaction()
      setTimeout(() => {
        if (props.position === 1) {
          setTime(true)
        }
      }, 10 * 1000)
    }
  }, [sendTransaction, props.position])

  useEffect(() => {
    if (data) {
      console.log("txHash transfer", data)
      // debugger
      props.setPosition(2)
      props.setPayed(true)
      // FIX: 
    }
  }, [data])

  useEffect(() => {
    if (isError) {
      props.consoleLog(error?.message ?? "Unknown error", false)
      props.setPositionError(2)
    }
    console.log(error)
  }, [error])
  //

  return (
    <SimpleCell
      disabled={props.positionError !== 2 && !time}
      onClick={() => props.reRender(2)}
      style={props.position !== 1 ? { opacity: 0.5 } : {}}
      after={
        props.positionError === 2 || time ? <Icon28RefreshOutline /> : null
      }
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
      Sign transaction
    </SimpleCell>
  )
})
