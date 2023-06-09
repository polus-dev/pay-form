import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  prepareSendTransaction,
  prepareWriteContract,
  sendTransaction,
  signTypedData,
  writeContract,
} from "wagmi/actions";
import {
  SwapOptions,
  SwapRouter,
  UniswapTrade,
} from "@uniswap/universal-router-sdk";
import { Percent } from "@uniswap/sdk-core";
import { PaymentHelper } from "../../../logic/payment";
import token_abi from "../../../token_abi.json";
import {
  DEFAULT_STAGE_TEXT,
  nextStage,
  setStage,
  setStageText,
  StageId,
  StageStatus,
} from "./transactionSlice";
import { TransactionError } from "./TransactionError";
import { RootState } from "../../../store/store";
import { BigNumber, ethers } from "ethers";
import { doPayThroughPolusContract } from "../../../logic/transactionEncode/doPayThroughPolusContract";
import { Permit2Permit } from "@uniswap/universal-router-sdk/dist/utils/permit2";
import { encodePay } from "../../../logic/transactionEncode/transactionEncode";
import {
  setSmartLineStatus,
  SmartLineStatus,
} from "../smartLine/smartLineSlice";
import { Token } from "../../api/types";
import { Blockchain_t } from "../../api/endpoints/types";

interface IPayload {
  userToken: Token;
  merchantToken: Token;
  consoleLog: (message: any, type?: boolean) => void;
  blockchain: Blockchain_t;
  uuid: string;
  userAddress: string;
  amount: string;
  fee: string;
  merchantAddress: string;
  feeAddress: string;
  merchantAmount: string;
}

export interface ThunkConfig {
  state: RootState;
}

export const startPay = createAsyncThunk<any, IPayload, ThunkConfig>(
  "transaction/pay",
  async (payload, { dispatch, rejectWithValue, getState, signal }) => {
    try {
      signal.addEventListener("abort", () => {
        return rejectWithValue("Aborted");
      });
      const isMetaMask = window.ethereum?.isMetaMask;

      const helper = new PaymentHelper(
        payload.blockchain,
        payload.userToken,
        payload.merchantToken,
        payload.userAddress
      );

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

      const amount = getState().transaction.pathTrade.amount;

      const checkAndApprove = async (
        contractType: Parameters<typeof helper.checkAllowanceToUserToken>[0],
        allowance: BigNumber
      ) => {
        if (allowance.lt(BigNumber.from(amount))) {
          needApproveDispatch(getState().transaction.currentStage);
          const preparedTransaction = await prepareWriteContract({
            address: payload.userToken.contract as `0x${string}`,
            abi: token_abi,
            functionName: "approve",
            args: [
              contractType === "permit"
                ? helper.PermitAddress
                : contractType === "router"
                ? helper.RouterAddress
                : helper.PolusAddress,
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
          text: "Check your balance...",
          status: StageStatus.LOADING,
        })
      );
      const balance = await helper.getBalance();
      if (balance.lt(BigNumber.from(amount))) {
        throw new TransactionError("Not enough balance", currentStage());
      }

      dispatch(
        setStageText({ stageId: currentStage(), text: "Sufficient balance" })
      );

      if (helper.Context === "polus contract" && !helper.userToken.is_native) {
        checkAllowanceDispatch(currentStage());
        const allowance = await helper.checkAllowanceToUserToken("polus");
        await checkAndApprove("polus", allowance);
      } else if (
        helper.Context === "universal router" &&
        !helper.userToken.is_native
      ) {
        if (isMetaMask) {
          checkAllowanceDispatch(currentStage());
          const allowance = await helper.checkAllowanceToUserToken("permit");
          await checkAndApprove("permit", allowance);
        } else {
          checkAllowanceDispatch(currentStage());
          const allowance = await helper.checkAllowanceToUserToken("router");
          await checkAndApprove("router", allowance);
        }
      }
      dispatch(
        setStage({
          stageId: currentStage(),
          text: "Approve success",
          status: StageStatus.SUCCESS,
        })
      );
      dispatch(nextStage());

      if (
        isMetaMask &&
        helper.Context === "universal router" &&
        !helper.userToken.is_native
      ) {
        dispatch(
          setStage({
            stageId: currentStage(),
            text: "Check permit",
            status: StageStatus.LOADING,
          })
        );
        const allowancePermit = await helper.checkPermit("router");
        if (
          !allowancePermit ||
          allowancePermit.amount < BigInt(amount) ||
          allowancePermit.expiration < Date.now() / 1000
        ) {
          dispatch(
            setStageText({
              stageId: currentStage(),
              text: "Need your permit sign",
            })
          );
          const dataForSign = helper.dataForSign(allowancePermit?.nonce ?? 0);
          const signature = await signTypedData(dataForSign);

          permitSign = {
            signature,
            ...dataForSign.value,
          } as any as Permit2Permit;

          dispatch(
            setStage({
              stageId: currentStage(),
              text: "Sign transaction success",
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
      const feeData = await helper.fetchFeeData();

      if (helper.Context === "universal router") {
        // dispatch(
        //   setStage({
        //     stageId: currentStage(),
        //     text: "Searching route",
        //     status: StageStatus.LOADING,
        //   })
        // );

        // const path = await helper.getSwapPath(payload.amount);
        // if (!path) {
        //   throw new TransactionError("Route not found", currentStage());
        // }
        // dispatch(
        //   setStageText({ stageId: currentStage(), text: "Route found" })
        // );

        const deadline = ~~(Date.now() / 1000) + 60 * 32;
        const swapOptions: SwapOptions = {
          slippageTolerance: new Percent("90", "100"),
          deadlineOrPreviousBlockhash: deadline.toString(),
          recipient: helper.RouterAddress,
        };
        if (permitSign) {
          swapOptions.inputTokenPermit = permitSign;
        }
        const { calldata } = SwapRouter.swapERC20CallParameters(
          getState().transaction.pathTrade.path,
          swapOptions
        );
        const isContextFromNative = helper.userToken.is_native;

        dispatch(
          setStageText({ stageId: currentStage(), text: "Encode transaction" })
        );
        const encodePayParams: Parameters<typeof encodePay>[0] = {
          uuid: payload.uuid.replaceAll("-", ""),
          fee: payload.fee,
          merchantAmount: (
            BigInt(payload.amount) - BigInt(payload.fee)
          ).toString(),
          tokenAddress: helper.userToken.address,
          merchant: payload.merchantAddress,
          asset_amount_decimals: payload.amount,
          feeRecipient: payload.feeAddress,
          txData: calldata,
          context: {
            from: isContextFromNative ? "native" : "erc20",
            to: helper.merchantToken.isNative ? "native" : "erc20",
          },
          universalRouterAddress: helper.RouterAddress,
        };
        const { data, path: universalRouterPath } = encodePay(encodePayParams);
        let value = BigNumber.from(0);
        if (universalRouterPath && isContextFromNative) {
          value = BigNumber.from(amount);
        }
        const preparedTransaction = await prepareSendTransaction({
          request: {
            to: helper.RouterAddress,
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
      } else if (helper.Context === "polus contract") {
        const isNative =
          helper.userToken.isNative && helper.merchantToken.isNative;
        const preparedTransaction = await prepareSendTransaction({
          request: {
            to: helper.PolusAddress,
            value: helper.userToken.isNative ? payload.amount : 0,
            data: doPayThroughPolusContract({
              uuid: payload.uuid,
              feeRecipient: payload.feeAddress,
              fee: payload.fee,
              merchant: payload.merchantAddress,
              merchantAmount: (
                BigInt(payload.amount) - BigInt(payload.fee)
              ).toString(),
              tokenAddress: isNative ? "" : payload.userToken.contract,
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
