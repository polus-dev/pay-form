import { useEffect, useRef } from "react";
import { Token } from "../../../store/api/types";
import { tokenPairPriceThunk } from "../../../store/features/tokenPairPrice/tokenPairPriceThunk";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";

export const useTokenPairPrice = (
  userToken: Token | undefined,
  merchantToken: Token | undefined,
  amountOut: string
) => {

  const { assetName, amount, isLoading } = useAppSelector(state => state.tokenPairPrice)
  const dispatch = useAppDispatch();
  const abort = useRef(() => { });

  useEffect(() => {
    if (!userToken || !merchantToken || !amountOut) return;
    if (isLoading) abort.current();
    abort.current = dispatch(tokenPairPriceThunk({ amountOut, userToken, merchantToken })).abort;
  }, [userToken, merchantToken, amountOut]);

  return { amount, isLoading, assetName };
};
