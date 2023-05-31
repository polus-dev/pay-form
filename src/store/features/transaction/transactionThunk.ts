import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  readContract,
  prepareWriteContract,
  writeContract,
  prepareSendTransaction,
  sendTransaction,
  signTypedData,
  fetchFeeData,
} from "wagmi/actions";
import { SwapOptions, SwapRouter } from "@uniswap/universal-router-sdk";
import { Percent } from "@uniswap/sdk-core";
import { ETHToWei, toBn, weiToEthNum } from "../../../logic/utils";
import {
  ConfigPayment,
  ListToken as Token,
  Payment,
  PolusChainId,
} from "../../../logic/payment";
import token_abi from "../../../token_abi.json";
import {
  setStage,
  setStageStatus,
  setStageText,
  StageStatus,
  StageId,
  DEFAULT_STAGE_TEXT,
  nextStage,
} from "./transactionSlice";
import { TransactionError } from "./TransactionError";
import { RootState } from "../../../store/store";
import { BigNumber, ethers } from "ethers";
import { doPayThroughPolusContract } from "../../../logic/transactionEncode/doPayThroughPolusContract";
import { CustomRouter } from "../../../logic/router";
import { Permit2Permit } from "@uniswap/universal-router-sdk/dist/utils/permit2";
import { encodePay } from "../../../logic/transactionEncode/transactionEncode";
import {
  setSmartLineStatus,
  SmartLineStatus,
} from "../smartLine/smartLineSlice";

interface IPayload {
  chainId: PolusChainId;
  userAddress: string;
  addressMerchant: string;
  feeRecipient: string;
  uuid: string;
  amountInDecimalsWithFee: string;
  amounrInDecimalsWithoutFee: string;
  tokenAddress: string;
  tokenA: Token;
  tokenB: Token;
  consoleLog: Function;
  fee: string;
  amountOut: string;
  asset_amount: string;
  asset_amount_without_fee: string;
}

interface IContext {
  from: TokenType;
  to: TokenType;
}

type TokenType = "native" | "erc20";

export interface ThunkConfig {
  state: RootState;
}

const decimalPlaces = 18; // TODO
export const startPay = createAsyncThunk<any, IPayload, ThunkConfig>(
  "transaction/pay",
  async (payload, { dispatch, rejectWithValue, getState, signal }) => {
    try {
      signal.addEventListener("abort", () => {
        return rejectWithValue("Aborted");
      });

      const isMetaMask = window.ethereum?.isMetaMask;
      const config: ConfigPayment = {
        networkId: payload.chainId,
        tokenA: payload.tokenA,
        tokenB: payload.tokenB,
        addressUser: payload.userAddress,
        addressMerchant: payload.addressMerchant,
        amountOut: payload.amountOut,
        callback: payload.consoleLog,
      };

      const payClass = new Payment(config);
      const context: "universal router" | "polus contract" =
        (payClass.tokenA.isNative && payClass.tokenB.isNative) ||
        (!payClass.tokenA.isNative &&
          payClass.tokenA.info.address[payload.chainId] ===
            payClass.tokenB.info.address[payload.chainId])
          ? "polus contract"
          : "universal router";

      let permitSign: Permit2Permit | null = null;

      const checkAllowanceDispatch = (stageId: StageId) =>
        dispatch(
          setStageText({ stageId, text: "Check allowance to smart contract" })
        );

      const needApproveDispatch = (stageId: StageId) =>
        dispatch(
          setStageText({ stageId, text: "Need approve to smart contract" })
        );

      const transactionPendingDispatch = (stageId: StageId) =>
        dispatch(setStageText({ stageId, text: "Transaction pending ..." }));

      const sendTransactionDispatch = (stageId: StageId) =>
        dispatch(setStageText({ stageId, text: "Send transaction ..." }));

      const currentStage = () => getState().transaction.currentStage;

      const checkAndApprove = async (
        contractType: Parameters<typeof payClass.checkAllowance>[1],
        allowance: any
      ) => {
        if (
          weiToEthNum(
            allowance,
            payClass.tokenA.info.decimals[payload.chainId]
          ) < payClass.tokenA.info.amountIn
        ) {
          needApproveDispatch(getState().transaction.currentStage);
          const preparedTransaction = await prepareWriteContract({
            address: payload.tokenAddress as any,
            abi: token_abi,
            functionName: "approve",
            args: [
              contractType === "permit"
                ? payClass.addressPermit
                : contractType === "router"
                ? payClass.addressRouter
                : payClass.addressPolusContract,
              ethers.constants.MaxUint256,
            ],
          });

          const { wait } = await writeContract(preparedTransaction);
          transactionPendingDispatch(currentStage());
          await wait();
        }
      };

      dispatch(
        setStage({
          stageId: currentStage(),
          text: "Chech your balance...",
          status: StageStatus.LOADING,
        })
      );
      const balance = await payClass.getBalance("A");
      if (
        weiToEthNum(balance, payClass.tokenA.info.decimals[payload.chainId]) <
        payClass.tokenA.info.amountIn
      ) {
        throw new TransactionError("Not enough balance", currentStage());
      }

      dispatch(
        setStageText({ stageId: currentStage(), text: "Sufficient balance" })
      );

      if (context === "polus contract" && !payClass.tokenA.isNative) {
        checkAllowanceDispatch(currentStage());
        const allowance = await payClass.checkAllowance("A", "polus");
        await checkAndApprove("polus", allowance);
      } else if (context === "universal router" && !payClass.tokenA.isNative) {
        if (isMetaMask) {
          checkAllowanceDispatch(currentStage());
          const allowance = await payClass.checkAllowance("A", "permit");
          await checkAndApprove("permit", allowance);
        } else {
          checkAllowanceDispatch(currentStage());
          const allowance = await payClass.checkAllowance("A", "router");
          await checkAndApprove("router", allowance);
        }
      }
      dispatch(
        setStage({
          stageId: currentStage(),
          text: "Approve succsess",
          status: StageStatus.SUCCESS,
        })
      );
      dispatch(nextStage());

      if (
        isMetaMask &&
        context === "universal router" &&
        !payClass.tokenA.isNative
      ) {
        dispatch(
          setStage({
            stageId: currentStage(),
            text: "Check permit",
            status: StageStatus.LOADING,
          })
        );
        const allowancePermit = await payClass.AllowancePermit("A", "router");
        if (
          !allowancePermit ||
          weiToEthNum(
            allowancePermit.amount,
            payClass.tokenA.info.decimals[payload.chainId]
          ) < payClass.tokenA.info.amountIn ||
          allowancePermit.expiration < Date.now() / 1000
        ) {
          dispatch(
            setStageText({
              stageId: currentStage(),
              text: "Need your permit sign",
            })
          );
          const dataForSign = payClass.dataForSign(allowancePermit?.nonce ?? 0);
          const signature = await signTypedData(dataForSign);

          const valueSigned = {
            signature,
            value: dataForSign.value,
          } as any as Permit2Permit;
          permitSign = valueSigned;

          dispatch(
            setStage({
              stageId: currentStage(),
              text: "Sign transaction succsess",
              status: StageStatus.SUCCESS,
            })
          );
        } else {
          dispatch(
            setStage({
              stageId: currentStage(),
              text: "Permit is fresh",
              status: StageStatus.SUCCESS,
            })
          );
        }
      } else {
        dispatch(
          setStage({
            stageId: currentStage(),
            text: "Permit unsupported",
            status: StageStatus.SUCCESS,
          })
        );
      }
      dispatch(nextStage());
      dispatch(
        setStage({
          stageId: currentStage(),
          status: StageStatus.LOADING,
          text: "Calculate fee",
        })
      );
      const feeData = await payClass.fetchFeeData();

      if (context === "universal router") {
        dispatch(
          setStage({
            stageId: currentStage(),
            text: "Searching route",
            status: StageStatus.LOADING,
          })
        );
        const amountOut = ETHToWei(
          payClass.amountOut,
          payload.tokenB.decimals[payload.chainId]
        );
        console.log("amountOut", amountOut);

        const router = new CustomRouter(payload.chainId);

        const path = await router.getRouter(
          amountOut,
          payClass.tokenA.erc20,
          payClass.tokenB.erc20
        );
        dispatch(
          setStageText({ stageId: currentStage(), text: "Route found" })
        );

        const deadline = ~~(Date.now() / 1000) + 60 * 32;
        const swapOptions: SwapOptions = {
          slippageTolerance: new Percent("90", "100"),
          deadlineOrPreviousBlockhash: deadline.toString(),
          recipient: payClass.addressRouter,
        };
        if (permitSign) {
          swapOptions.inputTokenPermit = permitSign;
        }

        const { calldata } = SwapRouter.swapERC20CallParameters(
          path!.trade,
          swapOptions
        );
        const isContextFromNative = payClass.tokenA.isNative;

        dispatch(
          setStageText({ stageId: currentStage(), text: "Encode transaction" })
        );
        const encodePayParams: Parameters<typeof encodePay>[0] = {
          uuid: payload.uuid.replaceAll("-", ""),
          fee: payload.fee,
          merchantAmount: payload.amounrInDecimalsWithoutFee,
          tokenAddress: payClass.tokenB.isNative
            ? undefined
            : payClass.tokenB.info.address[payload.chainId],
          merchant: payload.addressMerchant,
          asset_amount_decimals: payload.amountInDecimalsWithFee,
          feeRecipient: payload.feeRecipient,
          txData: calldata,
          context: {
            from: isContextFromNative ? "native" : "erc20",
            to: payClass.tokenB.isNative ? "native" : "erc20",
          },
          universalRouterAddress: payClass.addressRouter,
        };
        const { data, path: universalRouterPath } = encodePay(encodePayParams);
        let value = BigNumber.from(0);
        if (universalRouterPath && isContextFromNative) {
          value = await payClass.getValueForSwap(
            universalRouterPath,
            payload.amountInDecimalsWithFee
          );
        }
        const preparedTransaction = await prepareSendTransaction({
          request: {
            to: payClass.addressRouter,
            data,
            value,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas!,
            maxFeePerGas: feeData.maxFeePerGas!,
          },
        });

        sendTransactionDispatch(currentStage());
        const { wait } = await sendTransaction(preparedTransaction);
        dispatch(
          setStageText({
            stageId: currentStage(),
            text: "Wait transaction mine ...",
          })
        );
        await wait();
        dispatch(
          setStage({
            stageId: currentStage(),
            text: "Transaction succsess",
            status: StageStatus.SUCCESS,
          })
        );
      } else if (context === "polus contract") {
        const isNative = payClass.tokenA.isNative && payClass.tokenB.isNative;
        const tokenDecimals = await payClass.getDecimals();
        debugger;
        const calc = ethers.utils
          .parseUnits(payload.asset_amount, tokenDecimals)
          .sub(
            ethers.utils.parseUnits(
              payload.asset_amount_without_fee,
              tokenDecimals
            )
          )
          .toString();
        const preparedTransaction = await prepareSendTransaction({
          request: {
            to: payClass.addressPolusContract,
            value: payClass.tokenA.isNative
              ? ethers.utils.parseEther(
                  parseFloat(payClass.tokenA.info.amountIn.toString())
                    .toFixed(decimalPlaces)
                    .toString()
                )
              : 0,
            data: doPayThroughPolusContract({
              uuid: payload.uuid,
              feeRecipient: payload.feeRecipient,
              fee: ethers.utils
                .parseUnits(payload.asset_amount, tokenDecimals)
                .sub(
                  ethers.utils.parseUnits(
                    payload.asset_amount_without_fee,
                    tokenDecimals
                  )
                )
                .toString(),
              merchant: payload.addressMerchant,
              merchantAmount: ethers.utils
                .parseUnits(payload.asset_amount_without_fee, tokenDecimals)
                .toString(),
              tokenAddress: isNative ? "" : payload.tokenAddress,
            }),
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas!,
            maxFeePerGas: feeData.maxFeePerGas!,
          },
        });

        sendTransactionDispatch(currentStage());
        const { wait } = await sendTransaction(preparedTransaction);
        transactionPendingDispatch(currentStage());
        await wait();
        dispatch(
          setStage({
            stageId: currentStage(),
            text: "Transaction success",
            status: StageStatus.SUCCESS,
          })
        );
        dispatch(setSmartLineStatus(SmartLineStatus.SUCCSESS));
      }
    } catch (error) {
      dispatch(setSmartLineStatus(SmartLineStatus.ERROR));
      if (error instanceof TransactionError) {
        dispatch(
          setStage({
            stageId: error.stageid,
            status: StageStatus.FAILURE,
            text: DEFAULT_STAGE_TEXT[error.stageid],
          })
        );
        payload.consoleLog(error.message);
      } else {
        payload.consoleLog(
          error instanceof Error ? error.message : "unknown error"
        );
        return rejectWithValue(error);
      }
    }
  }
);

//
// const isv = verifyTypedData(
//   dataForSign.domain,
//   dataForSign.types,
//   dataForSign.value,
//   sign.data
// );
