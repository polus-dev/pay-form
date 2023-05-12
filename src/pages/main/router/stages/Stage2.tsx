
import {
  Icon24Spinner,
  Icon28CancelCircleOutline,
  Icon28CheckCircleOff,
  Icon28CheckCircleOn,
  Icon28RefreshOutline,
} from "@vkontakte/icons";
import { SimpleCell } from "@vkontakte/vkui";
import { ETHToWei, weiToEthNum } from "../../../../logic/utils";
import React, { FC, memo, useEffect, useMemo } from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  usePrepareSendTransaction,
  useSendTransaction,
  useSignTypedData,
} from "wagmi";
import { ProcessType } from "../ProcessType";
import { CustomRouter } from "../../../../logic/router";
import { encodePay } from "../../../../logic/transactionEncode/transactionEncode";
import { verifyTypedData } from "ethers/lib/utils.js";
import { ethers } from "ethers";
import { SwapOptions, SwapRouter } from "@uniswap/universal-router-sdk";
import { Percent } from "@uniswap/sdk-core";
import { Permit2Permit } from "@uniswap/universal-router-sdk/dist/utils/permit2";
import { Permit2AllowanceType } from "../../../../logic/payment";

// @ts-ignore
const isMetaMask = window.ethereum?.isMetaMask;


export const Stage2: FC<ProcessType> = memo((props) => {
  const [firstRender, setFirstRender] = React.useState<boolean>(false);


  const [firstRender2, setFirstRender2] = React.useState<boolean>(false);

  const [needToPermit, setNeedToPermit] = React.useState<boolean>(false);

  const [readyToSend, setReadyToSend] = React.useState<boolean>(false);

  const [dataForSign, setDataForSign] = React.useState<any>({}); // TODO: make type 

  const { payClass } = props;




  useEffect(() => {
    if ((props.payClass.tokenA.isNative || !isMetaMask) && !readyToSend) {
      setFirstRender(true);
      setReadyToSend(true)
    }
  }, [])


  const router = new CustomRouter(payClass?.networkId);
  // sign permit

  const sign = useSignTypedData({
    domain: dataForSign.domain,
    types: dataForSign.types,
    message: dataForSign.value,
  });



  useEffect(() => {
    // check allowance permit
    if (!firstRender && props.position === 1 && sign && !props.payClass.tokenA.isNative) {
      console.log("start sign");
      setFirstRender(true);
      if (!isMetaMask) {

        setReadyToSend(true);
      } else {

        payClass
          .AllowancePermit("A", "router")
          .then((allowance: Permit2AllowanceType | undefined) => {
            if (!allowance) {
              setNeedToPermit(true);
              return;
            }

            if (
              weiToEthNum(allowance.amount, payClass.tokenA.info.decimals[props.chainId]) <
              payClass.tokenA.info.amountIn ||
              allowance.expiration < Date.now() / 1000
            ) {

              const dataFS = payClass.dataForSign(allowance.nonce);
              setDataForSign(dataFS)
              setNeedToPermit(true);
              return;
            }
            setReadyToSend(true);
          });
      }
    }
  }, [props.position, sign]);

  // sign error handler

  useEffect(() => {
    if (sign.isError) {
      props.setPositionError(2);
    }
  }, [sign.isError]);

  useEffect(() => {
    if (needToPermit) sign.signTypedData();
  }, [needToPermit]);

  useEffect(() => {
    console.log("sign.data", sign.data);
    if (sign.data || readyToSend) {
      if (sign.data) {
        // TODO
        const isv = verifyTypedData(
          dataForSign.domain,
          dataForSign.types,
          dataForSign.value,
          sign.data
        );

        // console.log('sign.data', sign.data)

        console.log("sign:", isv === props.address);
      }

      const amountOut = ETHToWei(payClass.amountOut, props.tokenB.decimals[props.chainId]);
      console.log("amountOut", amountOut);

      if (!firstRender2 && firstRender) {
        console.log("start pa");
        setFirstRender2(true);
        router
          .getRouter(
            amountOut,
            props.payClass.tokenA.erc20,
            props.payClass.tokenB.erc20,
          )
          .then((path) => {
            if (path) {
              console.log("path 22", path);

              const deadline = ~~(Date.now() / 1000) + 60 * 32;

              const valuesSign: any = dataForSign.value ?? {};
              valuesSign.signature = sign.data;

              const permit2permit: Permit2Permit = valuesSign;

              console.log("start build params", permit2permit);

              const swapOptions: SwapOptions = {
                slippageTolerance: new Percent("90", "100"),
                deadlineOrPreviousBlockhash: deadline.toString(),
                recipient: payClass.addressRouter,
              };
              if (needToPermit) swapOptions.inputTokenPermit = permit2permit;

              const { calldata, value } = SwapRouter.swapERC20CallParameters(
                path.trade,
                swapOptions
              );

              // const ser = router.builder.serialize()
              // console.log(ser)

              console.log("deadline", deadline);

              console.log("value", value);

              // const datatr = UniversalRouter.encodeExecute(ser.commands, ser.inputs, deadline)

              // const datatr = UniversalRouter.encodeExecute(ser.commands, ser.inputs, deadline)

              const isContextFromNative = props.tokenA.native === true;
              const encodePayParams: Parameters<typeof encodePay>[0] = {
                uuid: props.uuid.replaceAll("-", ""),
                fee: props.fee,
                merchantAmount: props.asset_amount_decimals_without_fee,
                tokenAddress: props.tokenB.native ? undefined : props.tokenB.address[props.chainId],
                merchant: props.payClass.addressMerchant,
                asset_amount_decimals: props.asset_amount_decimals,
                feeRecipient: props.feeRecipient,
                txData: calldata,
                context: {
                  from: isContextFromNative ? "native" : "erc20",
                  to: props.tokenB.native === true ? "native" : "erc20",
                },
                universalRouterAddress: props.payClass.addressRouter
              };
              const encoded = encodePay(encodePayParams);

              props.setDataTr(encoded);

              if (isContextFromNative) {
                props.setTxValue?.(ethers.utils.parseEther('1'));
              }


              props.setPosition(2);

              props.reRender(3);
            } else {
              props.consoleLog("Error path", false);
              props.setPositionError(1);
            }
          });
        // })
      }

      // )
    }
  }, [props.position, sign.data, readyToSend]);

  return (
    <SimpleCell
      disabled={props.positionError !== 2}
      onClick={() => props.reRender(2)}
      style={props.position !== 1 ? { opacity: 0.5 } : {}}
      after={props.positionError === 2 ? <Icon28RefreshOutline /> : null}
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
      Sign your tokens
    </SimpleCell>
  );
});
