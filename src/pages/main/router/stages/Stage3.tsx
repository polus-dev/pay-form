import {
  Icon24Spinner,
  Icon28CancelCircleOutline,
  Icon28CheckCircleOff,
  Icon28CheckCircleOn,
  Icon28RefreshOutline,
} from "@vkontakte/icons";
import { SimpleCell } from "@vkontakte/vkui";
import React, { FC, memo, useEffect, useMemo } from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  usePrepareSendTransaction,
  useSendTransaction,
  useSignTypedData,
} from "wagmi";
import { ProcessType } from "../ProcessType";
import { BigNumber } from "ethers";


export const Stage3: FC<ProcessType> = memo((props) => {
  const [firstRender, setFirstRender] = React.useState<boolean>(false);
  const { config } = usePrepareSendTransaction({
    request: {
      to: props.payClass.addressRouter,
      data: props.dataTr,
      value: props.txValue
        ? BigNumber.from(props.txValue)
        : BigNumber.from("0"),
    },
  });

  const { data, isLoading, isSuccess, sendTransaction, error } =
    useSendTransaction(config);

  useEffect(() => {
    // console.log('start tr', props.position, props.dataTr, sendTransaction)
    if (
      !firstRender &&
      props.position === 2 &&
      sendTransaction &&
      props.dataTr
    ) {
      setFirstRender(true);

      console.log("props.dataTr", props.dataTr);
      setTimeout(() => {
        sendTransaction();
      }, 1000);
    }
  }, [props.position, props.dataTr, sendTransaction]);

  useEffect(() => {
    if (props.dataTr) {
      console.log("props.dataTr 2", props.dataTr);
      props.reRender(3);
    }
  }, [props.dataTr]);

  useEffect(() => {
    if (data) {
      console.log("txHash transfer", data);
      data.wait(1).then(() => {
        props.setPosition(3);

        props.setPayed(true);

        props.polusApi.changeBlockchain(props.uuid, 'evm') // смена блокчеина для богдана
      });
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      console.log("error: ", error);
      props.consoleLog(error?.message ?? "Unknown error", false);
      props.setPositionError(3);
    }
  }, [error]);

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
  );
})
