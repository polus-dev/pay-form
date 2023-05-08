import React, { useEffect } from "react"
import { FC, memo } from "react"
import { AllType } from "./AllType"
import { Stage1 } from "./stages/Stage1"
import { Stage2 } from "./stages/Stage2"
import { Stage3 } from "./stages/Stage3"

export const ContractStages: FC<AllType> = memo((props) => {
  const [firstRender, setFirstRender] = React.useState<boolean>(false)

  const [position, setPosition] = React.useState<number>(0)
  const [positionError, setPositionError] = React.useState<number>(0)

  const [oneId, setOneId] = React.useState<string>("100")
  const [twoId, setTwoId] = React.useState<string>("200")

  function reRender(id: number) {
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
  }, [position])

  return (
    <div id={props.id} className="process-block">
      <Stage1
        key={'1'}
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
        isNativeToNative={props.isNativeToNative}
        fee={props.fee}
        asset_amount_decimals_without_fee={props.asset_amount_decimals_without_fee}
        polusApi={props.polusApi}
        feeRecipient={props.feeRecipient}

      />
      <Stage2
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
        // fee={props.}
        setPayed={props.setPayed}
        isNativeToNative={props.isNativeToNative}
        fee={props.fee}
        asset_amount_decimals_without_fee={props.asset_amount_decimals_without_fee}
        polusApi={props.polusApi}
        feeRecipient={props.feeRecipient}
      />
      <Stage3
        key={"tree1"}
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
        isNativeToNative={props.isNativeToNative}
        fee={props.fee}
        asset_amount_decimals_without_fee={props.asset_amount_decimals_without_fee}
        polusApi={props.polusApi}
        feeRecipient={props.feeRecipient}

      />
    </div>
  )
})
