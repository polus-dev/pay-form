import { useEffect, useState } from "react";
import { CustomRouter } from "../../../logic/router";
import { ChainId } from "../../../store/api/endpoints/types";
import { Token } from "../../../store/api/types";
import { useAppSelector } from "../../../store/hooks";
import { Token as ERC20 } from "@uniswap/sdk-core";
import { CustomProvider, Payment } from "../../../logic/payment";

export const useTokenPrice = (
  userToken: Token,
  merketToken: Token,
  amountOut: number | string
) => {
  const [amount, setAmount] = useState(0);
  const currentBlockchain = useAppSelector(
    (state) => state.connection.currentBlockchain
  );

  useEffect(() => {
    const router = new CustomRouter(ChainId[currentBlockchain]);
    const tokenA = new ERC20(
      ChainId[currentBlockchain],
      userToken.contract,
      userToken.decimals
    );
    const tokenB = new ERC20(
      ChainId[currentBlockchain],
      userToken.contract,
      userToken.decimals
    );
    router.getRouter(amountOut, tokenA, tokenB).then((res) => {
      if (res) {
        const provider = new CustomProvider(currentBlockchain);
        provider.getValueForSwap(res.route.toString(), amountOut.toString());
      }
    });
  }, [currentBlockchain, userToken, merketToken, amountOut]);

  return { amount };
};
