import { createAsyncThunk } from "@reduxjs/toolkit";
import { setStage, setStageText, StageId, StageStatus } from "../transactionSlice";
import {
  prepareSendTransaction,
  sendTransaction,
} from "wagmi/actions";
import {
  SwapOptions,
  SwapRouter,
} from "@uniswap/universal-router-sdk";

import { Percent } from "@uniswap/sdk-core";
import { encodePay } from "../../../../logic/transactionEncode/transactionEncode";
import { BigNumber } from "ethers";
import { doPayThroughPolusContract } from "../../../../logic/transactionEncode/doPayThroughPolusContract";
import { ThunkConfig } from "../../../store";
export const sendThunk = createAsyncThunk<any, void, ThunkConfig>(
  "transaction/sendThunk",
  async (_, { getState, dispatch, rejectWithValue }) => {
    const currentStage = () => getState().transaction.currentStage;
    const sendAmount =
      getState().transaction.pathTrade.amount || getState().transaction.amount;

    const { signature, fee, uuid, expireAt, feeAddress, merchantAddress, merchantAmount } = getState().transaction.stages[StageId.SEND];

    const helper = getState().transaction.helper;

    if (!helper || !sendAmount || !currentStage || !fee || !uuid || !expireAt || !feeAddress || !merchantAddress || !merchantAmount) {
      throw new Error("Invalid data");
    }

    try {
      dispatch(
        setStage({
          status: StageStatus.LOADING,
          text: "Calculate fee",
        })
      );
      // const feeData = await helper.fetchFeeData();
      //
      let preparedTransaction: Awaited<ReturnType<typeof prepareSendTransaction>>;

      if (helper.Context === "universal router") {
        const deadline = Math.round(new Date(expireAt).getTime() / 1000);
        const swapOptions: SwapOptions = {
          slippageTolerance: new Percent("90", "100"),
          deadlineOrPreviousBlockhash: deadline.toString(),
          recipient: helper.RouterAddress,
        };
        if (signature) {
          swapOptions.inputTokenPermit = signature;
        }
        const { calldata } = SwapRouter.swapERC20CallParameters(
          getState().transaction.pathTrade.path,
          swapOptions
        );
        const isContextFromNative = helper.userToken.is_native;

        dispatch(setStageText("Encode transaction"));
        const encodePayParams: Parameters<typeof encodePay>[0] = {
          uuid: uuid.replaceAll("-", ""),
          fee,
          merchantAmount,
          tokenAddress: helper.merchantToken.contract,
          merchant: merchantAddress,
          asset_amount_decimals: sendAmount,
          feeRecipient: feeAddress,
          txData: calldata,
          context: {
            from: isContextFromNative ? "native" : "erc20",
            to: helper.merchantToken.is_native ? "native" : "erc20",
          },
          universalRouterAddress: helper.RouterAddress,
        };
        const { data, path: universalRouterPath } = encodePay(encodePayParams);
        let value;
        if (universalRouterPath && isContextFromNative) {
          value = BigNumber.from(sendAmount);
        }
        preparedTransaction = await prepareSendTransaction({
          request: {
            to: helper.RouterAddress,
            data,
            value,
            // maxPriorityFeePerGas: feeData.maxPriorityFeePerGas!,
            // maxFeePerGas: feeData.maxFeePerGas!,
          },
        });
      } else if (helper.Context === "polus contract") {
        const isNative =
          helper.userToken.is_native && helper.merchantToken.is_native;
        preparedTransaction = await prepareSendTransaction({
          request: {
            to: helper.PolusAddress,
            value: BigNumber.from(helper.userToken.is_native ? sendAmount : 0),
            data: doPayThroughPolusContract({
              uuid: uuid,
              feeRecipient: feeAddress,
              fee: fee,
              merchant: merchantAddress,
              merchantAmount: merchantAmount,
              tokenAddress: isNative ? "" : helper.userToken.contract,
            }),
            // maxPriorityFeePerGas: feeData.maxPriorityFeePerGas!,
            // maxFeePerGas: feeData.maxFeePerGas!,
          },
        });
      } else {
        throw new Error("Unknown context");
      }

      dispatch(setStageText("Send transaction ..."));

      const { wait } = await sendTransaction(preparedTransaction);
      dispatch(setStageText("Transaction pending ..."))
      await wait();
      dispatch(
        setStage({
          text: "Transaction success",
          status: StageStatus.SUCCESS,
        })
      );
    } catch (error) {
      return rejectWithValue(error);
    }
  });
