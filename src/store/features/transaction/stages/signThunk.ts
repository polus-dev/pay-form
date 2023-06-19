
import { createAsyncThunk } from "@reduxjs/toolkit";
import { nextStage, setPermitSignature, setStage, setStageText, StageStatus } from "../transactionSlice";
import { Permit2Permit } from "@uniswap/universal-router-sdk/dist/utils/permit2";

import {
  signTypedData,
} from "wagmi/actions";
import { ThunkConfig } from "../../../store";

export const signThunk = createAsyncThunk<any, void, ThunkConfig>(

  "transaction/signThunk",
  async (_, { getState, dispatch, rejectWithValue }) => {
    const currentStage = () => getState().transaction.currentStage;
    const isMetamask = getState().connection.isMetamask;
    const sendAmount =
      getState().transaction.pathTrade.amount || getState().transaction.amount;

    const helper = getState().transaction.helper;

    if (!helper || !sendAmount || !currentStage) {
      throw new Error("Invalid data");
    }

    try {
      if (
        isMetamask &&
        helper.Context === "universal router" &&
        !helper.userToken.is_native
      ) {
        dispatch(
          setStage({
            text: "Check permit",
            status: StageStatus.LOADING,
          })
        );
        const allowancePermit = await helper.checkPermit("router");
        if (
          !allowancePermit ||
          allowancePermit.amount < BigInt(sendAmount) ||
          allowancePermit.expiration < Date.now() / 1000
        ) {
          dispatch(setStageText("Need your permit sign"));
          const dataForSign = helper.dataForSign(allowancePermit?.nonce ?? 0);
          const signature = await signTypedData(dataForSign);
          const permitSign = {
            signature,
            ...dataForSign.value,
          } as any as Permit2Permit;

          dispatch(setPermitSignature(permitSign));
          dispatch(
            setStage({
              text: "Sign transaction success",
              status: StageStatus.SUCCESS,
            })
          );
        } else {
          dispatch(
            setStage({
              text: "Permit is fresh",
              status: StageStatus.SUCCESS,
            })
          );
        }
      } else {
        dispatch(
          setStage({
            text: "Native token",
            status: StageStatus.SUCCESS,
          })
        );
      }
      dispatch(nextStage());
    } catch (error) {
      return rejectWithValue(error)
    }
  });
