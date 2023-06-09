import {
  useLazyGetPaymentByPaymentIdQuery,
} from "../../../store/api/endpoints/payment/Payment";
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
  const currentBlockchain = useAppSelector(state => state.connection.currentBlockchain)

  const { availableTokens } = useAvailableTokens();
  const [merchantToken, setMerchantToken] = useState<Token>();

  const [expiresAt, setExpiresAt] = useState("0");
  const { isExpired, timer } = useTimer(expiresAt);

  const [info, setInfo] = useState<IPaymentInfo>();
  const [amountInMerchantToken, setAmountInMerchantToken] = useState("0");


  useEffect(() => {
    if (!info || !availableTokens.length) return;
    const assetKey = Object.keys(info.payment.assets[currentBlockchain])[0] as Asset_t;
    const token =  availableTokens.find(token => token.name === assetKey)
    const payment = info.payment.assets[currentBlockchain][Object.keys(info.payment.assets[currentBlockchain])[0] as Asset_t]
    setAmountInMerchantToken((BigInt(payment.amount) + BigInt(payment.fee)).toString())
    if (!token) throw new Error("usePaymentInfo: Token not found")
    setMerchantToken(token)
  }, [currentBlockchain, info]);

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
        setExpiresAt(paymentResponse.data.expires_at);
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
  }, []);

  return { isLoading, error, info, isExpired, timer, merchantToken,  amountInMerchantToken};
};
