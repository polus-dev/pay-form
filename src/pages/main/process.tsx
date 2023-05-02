import {
  Icon24Spinner,
  Icon28CancelCircleOutline,
  Icon28CheckCircleOff,
  Icon28CheckCircleOn,
  Icon28RefreshOutline,
} from "@vkontakte/icons";
import { IconButton, SimpleCell } from "@vkontakte/vkui";
import React, { useEffect } from "react";
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  usePrepareSendTransaction,
  useSendTransaction,
} from "wagmi";


import { BigNumber, ethers, utils } from "ethers";
import polus_abi from "../../polus_abi.json";
import token_abi from "../../token_abi.json";
import { MAX_APPROVE_AMOUNT } from "../../constants";
import { ConfigPayment, Payment } from "../../logic/payment";
import { doPayThroughPolusContract } from "../../logic/transactionEncode/doPayThroughPolusContract";
import { PolusApi } from "../../logic/api";

interface AllType {
  id: string;
  tokenAddress: string;
  addressPolus: string;
  address: `0x${string}`;
  amount: string;
  addressMerchant: string;
  currentAddressToken: string;
  uuid: string;
  consoleLog: Function;
  setPayed: Function;
  setProgress: Function;
  isNativeToNative: boolean
  asset_amount_decimals_without_fee: string;
  fee: string;
  polusApi: PolusApi
}

interface ProcessType {
  address: `0x${string}`;
  tokenAddress: string;
  addressPolus: string;
  position: number;
  setPosition: Function;
  positionError: number;
  setPositionError: Function;
  amount: string;
  addressMerchant: string;
  uuid: string;
  currentAddressToken: string;
  consoleLog: Function;
  reRender: Function;
  setPayed: Function;
  isNativeToNative: boolean
  asset_amount_decimals_without_fee: string;
  fee: string;
  polusApi: PolusApi
}

const ProcessOne: React.FC<ProcessType> = (props) => {
  const [firstRender, setFirstRender] = React.useState<boolean>(false);
  if (props.isNativeToNative) {
    props.setPosition(1);
    return null;
  }

  const addr: `0x${string}` = `0x${props.tokenAddress.replace("0x", "")}`;
  const contractRead = useContractRead({
    address: addr,
    abi: token_abi,
    functionName: "allowance",
    args: [props.address, props.addressPolus],
  });

  const { config } = usePrepareContractWrite({
    address: addr,
    abi: token_abi,
    functionName: "approve",
    args: [props.addressPolus, ethers.constants.MaxUint256],
  });
  const { data, write, error } = useContractWrite(config);

  useEffect(() => {
    if (!firstRender && write && props.position === 0 && contractRead.data) {
      setFirstRender(true);
      console.log("amount isApprove", contractRead.data);
      if (contractRead.data) {
        if (Number(contractRead.data) < +props.amount) {
          try {
            write();
          } catch (errorTry) {
            props.consoleLog(errorTry ?? "Unknown error", false);
            props.setPositionError(1);
          }
        } else {
          props.setPosition(1);
        }
      } else {
        console.log("addr", addr);
        console.log("props.address", props.address);
        console.log("props.addressPolus", props.addressPolus);
      }
    }
  }, [contractRead.data, write]);

  useEffect(() => {
    if (data) {
      console.log("txHash approve", data);
      props.setPosition(1);
      props.reRender(2);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      console.log("error: ", error);
      props.consoleLog(error?.message ?? "Unknown error", false);
      props.setPositionError(1);
    }
  }, [error]);

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
  );
};

const ProcessTwo: React.FC<ProcessType> = (props: ProcessType) => {
  const [firstRender, setFirstRender] = React.useState<boolean>(false);
  const [firstRender2, setFirstRender2] = React.useState<boolean>(false);

  const [time, setTime] = React.useState<boolean>(false);

  const addr: `0x${string}` = `0x${props.addressPolus.replace("0x", "")}`;
  const addrToken: `0x${string}` = `0x${props.tokenAddress.replace("0x", "")}`;


  const configForTransaction: Parameters<typeof usePrepareSendTransaction>[0] = {
    request: {
      to: props.addressPolus,
    }
  }

  if (props.isNativeToNative) {
    configForTransaction!.request!.value = utils.parseEther(props.amount);
    configForTransaction!.request!.data = doPayThroughPolusContract({
      uuid: props.uuid.replaceAll("-", ""),
      fee: props.fee,
      merchant: props.addressMerchant,
      merchantAmount: props.asset_amount_decimals_without_fee,
    })
  } else {
    configForTransaction!.request!.data = doPayThroughPolusContract({
      uuid: props.uuid.replaceAll("-", ""),
      fee: props.fee,
      merchant: props.addressMerchant,
      merchantAmount: props.asset_amount_decimals_without_fee,
      tokenAddress: props.tokenAddress,
    })
  }

  console.log('configForTransaction', configForTransaction)

  const { config } = usePrepareSendTransaction(configForTransaction);
  const { data, isLoading, isSuccess, sendTransaction, error, isError } =
    useSendTransaction(config);

  useEffect(() => {
    if (!firstRender && props.position === 1 && sendTransaction) {
      setFirstRender(true);
      sendTransaction()
      setTimeout(() => {
        if (props.position === 1) {
          setTime(true);
        }
      }, 10 * 1000);
    }
  }, [sendTransaction, props.position]);

  useEffect(() => {
    if (data) {
      console.log("txHash transfer", data);
      debugger
      props.setPosition(2);
      props.setPayed(true);
      // FIX: 
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      props.consoleLog(error?.message ?? "Unknown error", false);
      props.setPositionError(2);
    }
    console.log(error);
  }, [error]);
  //
  useEffect(() => {
    console.log("render");
  }, []);

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
  );
};

const ProcessTree: React.FC<ProcessType> = (props: ProcessType) => {
  const [firstRender, setFirstRender] = React.useState<boolean>(false);

  useEffect(() => {
    if (!firstRender) {
      setFirstRender(true);
    }
  }, []);

  useEffect(()=>{
    if (props.position === 2) {
      props.polusApi.changeBlockchain(props.uuid, 'evm') // смена блокчеина для богдана
    }

  }, [props.position])

  return (
    <SimpleCell
      disabled
      style={
        props.position !== 2
          ? { opacity: 0.5, marginBottom: "24px" }
          : { marginBottom: "24px" }
      }
      before={
        <div>
          {props.position < 2 ? <Icon28CheckCircleOff /> : null}
          {props.position === 2 ? (
            <Icon28CheckCircleOn fill="var(--button_commerce_background)" />
          ) : null}
        </div>
      }
    >
      Payment successfull
    </SimpleCell>
  );
};

export const ProcessAll: React.FC<AllType> = (props) => {
  const [firstRender, setFirstRender] = React.useState<boolean>(false);

  const [position, setPosition] = React.useState<number>(0);
  const [positionError, setPositionError] = React.useState<number>(0);

  const [oneId, setOneId] = React.useState<string>("100");
  const [twoId, setTwoId] = React.useState<string>("200");

  function reRender(id: number) {
    if (id === 1) {
      setOneId(`${Number(oneId) + 1}`);
    }
    if (id === 2) {
      setTwoId(`${Number(twoId) + 1}`);
    }
    setPositionError(0);
  }

  useEffect(() => {
    if (!firstRender) {
      setFirstRender(true);
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
      <ProcessOne
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
        // fee={props.}
        setPayed={props.setPayed}
        isNativeToNative={props.isNativeToNative}
        fee={props.fee}
        asset_amount_decimals_without_fee={props.asset_amount_decimals_without_fee}
        polusApi={props.polusApi}
      />
      <ProcessTree
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

      />
    </div>
  );
};
