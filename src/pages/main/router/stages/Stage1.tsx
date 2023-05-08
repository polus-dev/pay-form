
import {
  Icon24Spinner,
  Icon28CancelCircleOutline,
  Icon28CheckCircleOff,
  Icon28CheckCircleOn,
  Icon28RefreshOutline,
} from "@vkontakte/icons";
import { SimpleCell } from "@vkontakte/vkui";
import { weiToEthNum } from "../../../../logic/utils";
import React, { FC, memo, useEffect, useMemo } from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  usePrepareSendTransaction,
  useSendTransaction,
  useSignTypedData,
} from "wagmi";
import { ProcessType } from "../ProcessType";
import { PolusContractAddress } from "../../../../logic/transactionEncode/types/polusContractAbi";


export const Stage1: FC<ProcessType> = memo((props) => {
  const [firstRender, setFirstRender] = React.useState<boolean>(false);
  const [firstRenderForNativeToken, setFirstRenderForNativeToken] = React.useState<boolean>(false);

  const isMetaMask = window.ethereum?.isMetaMask;

  const { payClass } = props;

  useEffect(() => {
    if (!firstRenderForNativeToken && payClass.tokenA.isNative) {
      setFirstRenderForNativeToken(true);
      props.setPosition(1);
    }
  }, [])


  const { config } = usePrepareContractWrite(payClass?.ApproveSyncPermit());

  const { data, write, error } = useContractWrite(config);

  const { config: config2 } = usePrepareContractWrite(payClass.Approve(isMetaMask ? PolusContractAddress[props.chainId] : 'router')); // aprove for router

  const approveNotMetamask = useContractWrite(config2);

  useEffect(() => {
    // check balance and allownce
    if (!firstRender && write && props.position === 0 && payClass && approveNotMetamask.write) {
      payClass.getBalance("A").then((b) => {
        if (
          weiToEthNum(b, payClass.tokenA.info.decimals[props.chainId]) <
          payClass.tokenA.info.amountIn
        ) {
          props.consoleLog("Not enough balance", false);
          props.setPositionError(1);
          return;
        }


        if (!isMetaMask) {
          payClass.checkAllowance('A', 'router').then(amount => {
            if (weiToEthNum(amount, payClass.tokenA.info.decimals[props.chainId]) < payClass.tokenA.info.amountIn) {
              if (approveNotMetamask.write) approveNotMetamask.write()
              else console.error('write approve null')
              return
            }
            props.setPosition(1);
          })
        } else {

          payClass.checkAllowance("A", "permit").then((amount) => {
            if (
              (weiToEthNum(amount, payClass.tokenA.info.decimals[props.chainId]) <
                payClass.tokenA.info.amountIn) && isMetaMask
            ) {
              try {
                write();
              } catch (errorTry) {
                props.consoleLog(errorTry ?? "Unknown error", false);
                props.setPositionError(1);
              }
              return; // если нужен апрув
            }
            console.log("next");
            props.setPosition(1);
          });
        }
      });


      setFirstRender(true);
    }
  }, [write, approveNotMetamask.write]);

  useEffect(() => {
    if (data || approveNotMetamask.data) {
      console.log("txHash approve", data ?? approveNotMetamask.data);
      // data.wait(1).then(() => {
      setTimeout(() => {
        props.setPosition(1);
        props.reRender(2);
      }, 1000);

      // })
    }
  }, [data, approveNotMetamask.data]);

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
});
