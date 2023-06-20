import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { CustomRouter } from "../../../logic/router";
import { ChainId } from "../../api/endpoints/types";
import { Token } from "../../api/types";
import { Percent, Token as ERC20 } from "@uniswap/sdk-core";
import { CustomProvider, WrapAltToken } from "../../../logic/payment";
import { SwapOptions, SwapRouter } from "@uniswap/universal-router-sdk";
import { getPathFromCallData, roundCryptoAmount } from "../../../logic/utils";
import { ThunkConfig } from "../../store";
import { ITokenPairPriceState } from "./tokenPairPriceSlice";
import { setPathTrade } from "../transaction/transactionSlice";

interface IPayload {
  userToken: Token;
  merchantToken: Token;
  amountOut: string;
}

interface ITokenPairPriceReturnType
  extends Required<Omit<ITokenPairPriceState, "isLoading">> {}

export const tokenPairPriceThunk = createAsyncThunk<
  ITokenPairPriceReturnType,
  IPayload,
  ThunkConfig
>(
  "tokenPairPriceThunk/fetch",
  async (payload, { rejectWithValue, getState, dispatch }) => {
    debugger;
    if (payload.userToken.contract === payload.merchantToken.contract) {
      return {
        assetName: payload.userToken.name.toUpperCase(),
        amount: roundCryptoAmount(
          ethers.utils.commify(
            ethers.utils.formatUnits(
              payload.amountOut,
              payload.userToken.decimals
            )
          )
        ),
      };
    }
    const currentBlockchain = getState().connection.currentBlockchain;
    if (!currentBlockchain)
      return rejectWithValue("useTokenPrice: No blockchain") as any;

    const router = new CustomRouter(ChainId[currentBlockchain]);
    const tokenA = payload.userToken.is_native
      ? WrapAltToken.wrap(ChainId[currentBlockchain])
      : new ERC20(
          ChainId[currentBlockchain],
          payload.userToken.contract,
          payload.userToken.decimals
        );
    const tokenB = payload.merchantToken.is_native
      ? WrapAltToken.wrap(ChainId[currentBlockchain])
      : new ERC20(
          ChainId[currentBlockchain],
          payload.merchantToken.contract,
          payload.merchantToken.decimals
        );
    const response1 = await router.getRouter(payload.amountOut, tokenA, tokenB);

    if (!response1) {
      return rejectWithValue("No response from router");
    }

    const provider = new CustomProvider(currentBlockchain);
    const deadline = ~~(Date.now() / 1000) + 60 * 32;
    const swapOptions: SwapOptions = {
      slippageTolerance: new Percent("90", "100"),
      deadlineOrPreviousBlockhash: deadline.toString(),
      recipient: provider.RouterAddress,
    };

    const { calldata } = SwapRouter.swapERC20CallParameters(
      response1.trade,
      swapOptions
    );

    const response2 = await provider.getValueForSwap(
      getPathFromCallData(calldata),
      payload.amountOut
    );
    dispatch(
      setPathTrade({
        amount: response2.toString(),
        path: response1.trade,
      })
    );

    return {
      assetName: payload.userToken.name.toUpperCase(),
      amount: roundCryptoAmount(
        ethers.utils.commify(
          ethers.utils.formatUnits(
            response2.toString(),
            payload.userToken.decimals
          )
        )
      ),
    };
  }
);
