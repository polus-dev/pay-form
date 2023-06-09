import { useEffect, useState } from "react";
import { CustomRouter } from "../../../logic/router";
import { ChainId } from "../../../store/api/endpoints/types";
import { Token } from "../../../store/api/types";
import { useAppSelector } from "../../../store/hooks";
import { Percent, Token as ERC20 } from "@uniswap/sdk-core";
import { CustomProvider, Payment } from "../../../logic/payment";
import { SwapOptions, SwapRouter } from "@uniswap/universal-router-sdk";
import { getPathFromCallData } from "../../../logic/utils";
import { ethers } from "ethers";

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
      const tokenA = new ERC20(
        ChainId[currentBlockchain],
        userToken.contract,
        userToken.decimals
      );
      const tokenB = new ERC20(
        ChainId[currentBlockchain],
        merchantToken.contract,
        merchantToken.decimals
      );
      router.getRouter(amountOut, tokenA, tokenB).then((res) => {
        if (res) {
          const provider = new CustomProvider(currentBlockchain);
          const deadline = ~~(Date.now() / 1000) + 60 * 32;
          const swapOptions: SwapOptions = {
            slippageTolerance: new Percent("90", "100"),
            deadlineOrPreviousBlockhash: deadline.toString(),
            recipient: provider.RouterAddress,
          };

          const { calldata } = SwapRouter.swapERC20CallParameters(
            res.trade,
            swapOptions
          );

          const path = getPathFromCallData(calldata);

          provider.getValueForSwap(path, amountOut).then((res) => {
            setAmount(
              ethers.utils.commify(
                ethers.utils.formatUnits(res.toString(), userToken.decimals)
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
