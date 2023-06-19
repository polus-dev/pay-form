import { createAsyncThunk } from "@reduxjs/toolkit";
import { BigNumber, ethers } from "ethers";
import { nextStage, setStage, setStageText, StageId, StageStatus } from "../transactionSlice";
import { erc20ABI } from '@wagmi/core'


import {
  prepareWriteContract,
  writeContract,
} from "wagmi/actions";
import { TransactionError } from "../TransactionError";
import { ThunkConfig } from "../../../store";

export const approveThunk = createAsyncThunk<any, void, ThunkConfig>(
  "transaction/approveThunk",
  async (_, { getState, dispatch, rejectWithValue }) => {
    const currentStage = () => getState().transaction.currentStage;
    const isMetamask = getState().connection.isMetamask;
    const sendAmount =
      getState().transaction.pathTrade.amount || getState().transaction.amount;

    const helper = getState().transaction.helper;

    if (!helper || !sendAmount || !currentStage) {
      return;
    }

    try {
      const checkAndApprove = async (
        contractType: Parameters<typeof helper.checkAllowanceToUserToken>[0],
        allowance: BigNumber
      ) => {
        if (allowance.lt(BigNumber.from(sendAmount))) {
          dispatch(setStageText("Need approve to smart contract"));
          const preparedTransaction = await prepareWriteContract({
            address: helper.userToken.contract as `0x${string}`,
            abi: erc20ABI,
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
          dispatch(setStageText("Transaction pending ..."));
          await wait();
        }
      };


      dispatch(
        setStage({
          text: "Check your balance...",
          status: StageStatus.LOADING,
        })
      );
      const balance = await helper.getBalance();
      if (balance.lt(BigNumber.from(sendAmount))) {
        throw new TransactionError("Not enough balance", currentStage());
      }

      dispatch(setStageText("Sufficient balance"));
      dispatch(setStageText("Check allowance to smart contract"));

      if (helper.Context === "polus contract" && !helper.userToken.is_native) {
        const allowance = await helper.checkAllowanceToUserToken("polus");
        await checkAndApprove("polus", allowance);
      } else if (
        helper.Context === "universal router" &&
        !helper.userToken.is_native
      ) {
        if (isMetamask) {
          const allowance = await helper.checkAllowanceToUserToken("permit");
          await checkAndApprove("permit", allowance);
        } else {
          const allowance = await helper.checkAllowanceToUserToken("router");
          await checkAndApprove("router", allowance);
        }
      }
      dispatch(
        setStage({
          text: "Approve success",
          status: StageStatus.SUCCESS,
        })
      );
      dispatch(nextStage())

    } catch (error) {
      return rejectWithValue(error)
      // if (error instanceof TransactionError) {
      //   dispatch(
      //     setStage({
      //       text: error.message,
      //       status: StageStatus.FAILURE,
      //     })
      //   );
      // } else {
      //   dispatch(
      //     setStage({
      //       text: "Transaction failed",
      //       status: StageStatus.FAILURE,
      //     })
      //   );
      // }
      //
      throw error;
    }
  }
)
