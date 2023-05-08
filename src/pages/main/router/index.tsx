import { ethers } from "ethers";
import { ConfigPayment, Payment } from "../../../logic/payment";
import React, { memo, useEffect, useMemo } from "react";
import { AllType } from "./AllType";
import { Stage3 } from "./stages/Stage3";
import { Stage2 } from "./stages/Stage2";
import { Stage1 } from "./stages/Stage1";

export const RouterStages: React.FC<AllType> = memo((props) => {
  const [firstRender, setFirstRender] = React.useState<boolean>(false);

  const [position, setPosition] = React.useState<number>(0);
  const [positionError, setPositionError] = React.useState<number>(0);

  const [oneId, setOneId] = React.useState<string>("100");
  const [twoId, setTwoId] = React.useState<string>("200");
  const [treId, setTreId] = React.useState<string>("300");

  const [dataTr, setDataTr] = React.useState<string | undefined>(undefined);
  const [txValue, setTxValue] = React.useState<string | null>();

  const [feeData, setFeeData] = React.useState<
    ethers.providers.FeeData | undefined
  >(undefined);

  const config: ConfigPayment = {
    networkId: props.chainId,
    tokenA: props.tokenA,
    tokenB: props.tokenB,
    addressUser: props.address,
    addressMerchant: props.addressMerchant,
    amountOut: props.amountOut.toString(),
    callback: props.consoleLog,
  };

  const payClass: Payment = useMemo(() => new Payment(config), []);

  function reRender(id: number) {
    if (id === 1) {
      setOneId(`${Number(oneId) + 1}`);
    }
    if (id === 2) {
      setTwoId(`${Number(twoId) + 1}`);
    }
    if (id === 3) {
      setTreId(`${Number(twoId) + 1}`);
    }
    setPositionError(0);
  }

  useEffect(() => {
    if (!firstRender) {
      setFirstRender(true);

      payClass.getFee().then((fee) => {
        setFeeData(fee);
      });
    }
  }, []);

  useEffect(() => {
    if (position === 0) {
      props.setProgress(50);
    }
    if (position === 1) {
      props.setProgress(75);
    }
    if (position === 2) {
      props.setProgress(100);
    }
  }, [position]);

  return (
    <div id={props.id} className="process-block">
      <Stage1
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
        asset_amount_decimals_without_fee={
          props.asset_amount_decimals_without_fee
        }
        asset_amount_decimals={props.asset_amount_decimals}
        fee={props.fee}
        chainId={props.chainId}
        polusApi={props.polusApi}
        feeRecipient={props.feeRecipient}
      />
      <Stage2
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
        setTxValue={setTxValue}
        tokenB={props.tokenB}
        fullListTokensUp={props.fullListTokensUp}
        asset_amount_decimals_without_fee={
          props.asset_amount_decimals_without_fee
        }

        asset_amount_decimals={props.asset_amount_decimals}
        fee={props.fee}
        chainId={props.chainId}
        polusApi={props.polusApi}
        feeRecipient={props.feeRecipient}
      />
      <Stage3
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
        asset_amount_decimals_without_fee={
          props.asset_amount_decimals_without_fee
        }
        asset_amount_decimals={props.asset_amount_decimals}
        fee={props.fee}
        chainId={props.chainId}
        txValue={txValue}
        setTxValue={setTxValue}
        polusApi={props.polusApi}
        feeRecipient={props.feeRecipient}
      />
    </div>
  );
});
