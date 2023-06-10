import { useEffect, useState } from "react";
import { CustomRouter } from "../../../logic/router";
import { ChainId } from "../../../store/api/endpoints/types";
import { Token } from "../../../store/api/types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { Percent, Token as ERC20, WETH9 } from "@uniswap/sdk-core";
import { CustomProvider, WrapAltToken } from "../../../logic/payment";
import { SwapOptions, SwapRouter } from "@uniswap/universal-router-sdk";
import { getPathFromCallData } from "../../../logic/utils";
import { ethers } from "ethers";
import { setPathTrade } from "../../../store/features/transaction/transactionSlice";

export const useTokenPrice = (
  userToken: Token | undefined,
  merchantToken: Token | undefined,
  amountOut: string
) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const currentBlockchain = useAppSelector(
    (state) => state.connection.currentBlockchain
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!userToken || !merchantToken || !amountOut || isLoading) return;
    try {
      if (userToken.contract === merchantToken.contract) {
        setAmount(
          ethers.utils.commify(
            ethers.utils.formatUnits(amountOut, userToken.decimals)
          )
        );
        return;
      }
      setIsLoading(true);
      const router = new CustomRouter(ChainId[currentBlockchain]);
      const tokenA = userToken.is_native
        ? WrapAltToken.wrap(ChainId[currentBlockchain])
        : new ERC20(
            ChainId[currentBlockchain],
            userToken.contract,
            userToken.decimals
          );
      const tokenB = merchantToken.is_native
        ? WrapAltToken.wrap(ChainId[currentBlockchain])
        : new ERC20(
            ChainId[currentBlockchain],
            merchantToken.contract,
            merchantToken.decimals
          );
      console.log("amountOut ", amountOut);
      router.getRouter(amountOut, tokenA, tokenB).then((response1) => {
        if (response1) {
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

          const path = getPathFromCallData(calldata);

          provider.getValueForSwap(path, amountOut).then((response2) => {
            console.log(response2);
            dispatch(
              setPathTrade({
                amount: response2.toString(),
                path: response1.trade,
              })
            );
            setAmount(
              ethers.utils.commify(
                ethers.utils.formatUnits(
                  response2.toString(),
                  userToken.decimals
                )
              )
            );
            setIsLoading(false);
          });
        }
      });
    } catch (error) {
      setIsLoading(false);
      setAmount("error");
    }
  }, [currentBlockchain, userToken, merchantToken, amountOut]);

  return { amount, isLoading };
};
