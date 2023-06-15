import { useLazyGetPaymentByPaymentIdQuery } from "../../../store/api/endpoints/payment/Payment";
import { useEffect, useState } from "react";
import { ResponseApiCode } from "../../../store/api/responseApiCode";
import { useLazyGetMerchantByIdQuery } from "../../../store/api/endpoints/merchant/Merchant";
import { IGetMerchantByIdResponse } from "../../../store/api/endpoints/merchant/Merchant.interface";
import { IGetPaymentsResponse } from "../../../store/api/endpoints/payment/Payment.interface";
import { useTimer } from "./useTimer";
import { Token } from "../../../store/api/types";
import { useAppSelector } from "../../../store/hooks";
import { Asset_t } from "../../../store/api/endpoints/types";
import { useAvailableTokens } from "./useAvailableTokens";

interface IError {
  message: string;
  code: ResponseApiCode;
}

export interface IPaymentInfo {
  merchant: IGetMerchantByIdResponse;
  payment: IGetPaymentsResponse;
}

export const usePaymentInfo = (uuid: string | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<IError>();
  const [getPaymentInfo] = useLazyGetPaymentByPaymentIdQuery();
  const [getMerchantInfo] = useLazyGetMerchantByIdQuery();
  const currentBlockchain = useAppSelector(
    (state) => state.connection.currentBlockchain
  );

  const { availableTokens } = useAvailableTokens();
  const [merchantToken, setMerchantToken] = useState<Token>();

  const [expireAt, setExpireAt] = useState("");
  const { isExpired, timer } = useTimer(expireAt);

  const [info, setInfo] = useState<IPaymentInfo>();
  const [amountInMerchantToken, setAmountInMerchantToken] = useState("0");
  const [fee, setFee] = useState("0");
  const [merchantAmount, setMerchantAmount] = useState("0");
  const [merchantAddress, setMerchantAddress] = useState("");

  useEffect(() => {
    if (!info || !availableTokens.length || !currentBlockchain) return;
    // if (!currentBlockchain) throw new Error("usePaymentInfo: No blockchain");
    const assetKey = Object.keys(
      info.payment.assets[currentBlockchain]
    )[0] as Asset_t;
    const token = availableTokens.find((token) => token.name === assetKey);
    const payment =
      info.payment.assets[currentBlockchain][
      Object.keys(info.payment.assets[currentBlockchain])[0] as Asset_t
      ];
    setAmountInMerchantToken(
      (BigInt(payment.amount) + BigInt(payment.fee)).toString()
    );
    setFee(payment.fee);
    setMerchantAmount(payment.amount);
    setMerchantAddress(payment.address);
    if (!token) throw new Error("usePaymentInfo: Token not found");
    setMerchantToken(token);
  }, [currentBlockchain, info, availableTokens]);

  useEffect(() => {
    setIsLoading(true);
    if (!uuid) {
      setIsLoading(false);
      setError({
        message: "Invalid uuid",
        code: ResponseApiCode.InvalidUUID,
      });
      return;
    }
    getPaymentInfo({ payment_id: uuid }).then((paymentResponse) => {
      if (paymentResponse.data && !paymentResponse.error) {
        setExpireAt(paymentResponse.data.expires_at);
        getMerchantInfo({ merchant_id: paymentResponse.data.merchant_id }).then(
          (merchantResponse) => {
            if (merchantResponse.data && !merchantResponse.error) {
              setInfo({
                payment: paymentResponse.data!,
                merchant: merchantResponse.data,
              });
            } else if (merchantResponse.error) {
              setError({
                message: "Error load data merchant",
                code: 1002,
              });
            }
          }
        );
      } else if (paymentResponse.error) {
        setError({
          message: "Error load data invoice",
          code: 1002,
        });
      }
    });
    setIsLoading(false);
  }, [currentBlockchain]);

  return {
    isLoading,
    error,
    info,
    isExpired,
    timer,
    merchantToken,
    amountInMerchantToken,
    fee,
    merchantAmount,
    merchantAddress,
    expireAt,
  };
};
