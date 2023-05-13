import { AllType as T1 } from "../pages/main/router/AllType"
import { AllType as T2 } from "../pages/main/contract/AllType"

import { StageStatus } from "store/features/transaction/transactionSlice"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { Stage } from "./Stage"
import { useLayoutEffect } from "react"
import { startPay } from "../store/features/transaction/transactionThunk"


export const ProcessBlock = (props: T1 & T2) => {
  const stages = useAppSelector(state => state.transaction.stages)
  const dispatch = useAppDispatch();
  useLayoutEffect(() => {
    dispatch(startPay({
      polusContractAddress: props.addressPolus,
      tokenA: props.tokenA,
      tokenB: props.tokenB,
      userAddress: props.address,
      tokenAddress: props.tokenAddress,
      chainId: props.chainId,
      consoleLog: props.consoleLog,
      amountInDecimalsWithFee: props.asset_amount_decimals,
      addressMerchant: props.addressMerchant,
      amounrInDecimalsWithoutFee: props.asset_amount_decimals_without_fee,
      feeRecipient: props.feeRecipient,
      uuid: props.uuid,
      fee: props.fee
    }))

  }, [])
  return (
    <div id={props.id} className="proccess-block">
      {stages.map((stage, index) => (
        <Stage
          key={index}
          text={stage.statusText}
          isError={stage.status === StageStatus.FAILURE}
          disabled={stage.status === StageStatus.PENDING}
          isLoading={stage.status === StageStatus.LOADING}
          isSuccsess={stage.status === StageStatus.SUCCESS}
          isPending={stage.status === StageStatus.PENDING}
          onClick={() => { }}
        />
      ))}
    </div>
  )
}
