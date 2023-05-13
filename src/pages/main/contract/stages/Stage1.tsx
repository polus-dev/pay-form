import { FC, memo, useEffect, useState } from "react"
import { useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi"
import { ProcessType } from "../ProcessType"
import { fetchBlockNumber } from 'wagmi/actions'

import token_abi from "../../../../token_abi.json"
import { ethers } from "ethers"
import { SimpleCell } from "@vkontakte/vkui"
import { Icon24Spinner, Icon28CancelCircleOutline, Icon28CheckCircleOn, Icon28RefreshOutline } from "@vkontakte/icons"

export const Stage1: FC<ProcessType> = memo((props) => {
  const [firstRender, setFirstRender] = useState(false)
  if (props.isNativeToNative) {
    props.setPosition(1)
    return null
  }

  // TODO: check balance of token

  const addr: `0x${string}` = `0x${props.tokenAddress.replace("0x", "")}`
  const contractRead = useContractRead({
    address: addr,
    abi: token_abi,
    functionName: "allowance",
    args: [props.address, props.addressPolus]
  })

  const { config } = usePrepareContractWrite({
    address: addr,
    abi: token_abi,
    functionName: "approve",
    args: [props.addressPolus, ethers.constants.MaxUint256]
  })


  const { data, write, error } = useContractWrite(config)

  useEffect(() => {
    if (!firstRender && write && props.position === 0 && contractRead.data) {
      setFirstRender(true)
      console.log("amount isApprove", contractRead.data)
      if (contractRead.data) {
        if (Number(contractRead.data) < +props.amount) {
          try {
            write()
          } catch (errorTry) {
            props.consoleLog(errorTry ?? "Unknown error", false)
            props.setPositionError(1)
          }
        } else {
          props.setPosition(1)
        }
      } else {
        console.log("addr", addr)
        console.log("props.address", props.address)
        console.log("props.addressPolus", props.addressPolus)
      }
    }
  }, [contractRead.data, write])

  useEffect(() => {
    if (data) {
      console.log("txHash approve", data)
      props.setPosition(1)
      props.reRender(2)
    }
  }, [data])

  useEffect(() => {
    if (error) {
      console.log("error: ", error)
      props.consoleLog(error?.message ?? "Unknown error", false)
      props.setPositionError(1)
    }
  }, [error])

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
})
