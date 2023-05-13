import { createAsyncThunk } from "@reduxjs/toolkit"
import { readContract, prepareWriteContract, writeContract, prepareSendTransaction, sendTransaction, signTypedData } from "wagmi/actions"
import { weiToEthNum } from "../../../logic/utils";
import { ConfigPayment, ListToken as Token, Payment, PolusChainId } from "../../../logic/payment"
import token_abi from "../../../token_abi.json"
import { setStage, setStageStatus, setStageText, StageStatus } from "./transactionSlice";
import { TransactionError } from "./TransactionError";
import { RootState } from "../../../store/store";
import { ethers } from "ethers";
import { doPayThroughPolusContract } from "../../../logic/transactionEncode/doPayThroughPolusContract";

interface IPayload {
  chainId: PolusChainId;
  userAddress: string;
  addressMerchant: string;
  feeRecipient: string;
  uuid: string;
  amountInDecimalsWithFee: string;
  amounrInDecimalsWithoutFee: string;
  polusContractAddress: string;
  tokenAddress: string;
  tokenA: Token;
  tokenB: Token;
  consoleLog: Function;
  fee: string;
}


interface IContext {
  from: TokenType;
  to: TokenType;
}


type TokenType = "native" | "erc20";

export const startPay = createAsyncThunk(
  'transaction/pay',
  async (payload: IPayload, { dispatch, getState, }) => {
    try {
      const tempGetStateF = () => <RootState>getState();
      const isMetaMask = window.ethereum?.isMetaMask;
      const config: ConfigPayment = {
        networkId: payload.chainId,
        tokenA: payload.tokenA,
        tokenB: payload.tokenB,
        addressUser: payload.userAddress,
        addressMerchant: payload.addressMerchant,
        amountOut: payload.amountInDecimalsWithFee,
        callback: payload.consoleLog,
      };

      const payClass = new Payment(config);

      const context: "universal router" | "polus contract" = (payClass.tokenA.isNative && payClass.tokenB.isNative) || (!payClass.tokenA.isNative && payClass.tokenA.info.address[payload.chainId] === payClass.tokenB.info.address[payload.chainId]) ? "polus contract" : "universal router";

      /// 1. Approve


      const balance = await payClass.getBalance("A")
      if (
        weiToEthNum(balance, payClass.tokenA.info.decimals[payload.chainId]) <
        payClass.tokenA.info.amountIn
      ) {
        throw new TransactionError("Not enough balance", tempGetStateF().transaction.currentStage)
      }

      if (context === "polus contract" && !payClass.tokenA.isNative) {
        const allowance = await payClass.checkAllowance("A", "polus")
        if (weiToEthNum(allowance, payClass.tokenA.info.decimals[payload.chainId]) < payClass.tokenA.info.amountIn) {
          // throw new TransactionError("Not enough allowance", (<RootState>getState()).transaction.currentStage)


          const preparedTransaction = await prepareWriteContract({
            address: payload.tokenAddress as any,
            abi: token_abi,
            functionName: "approve",
            args: [payload.polusContractAddress, ethers.constants.MaxUint256]
          })

          const { wait } = await writeContract(preparedTransaction)
          await wait()
        }



      } else if (context === "universal router" && !payClass.tokenA.isNative) {
        if (isMetaMask) {
          const allowance = await payClass.checkAllowance("A", "permit")
          if (weiToEthNum(allowance, payClass.tokenA.info.decimals[payload.chainId]) < payClass.tokenA.info.amountIn) {
            // throw new TransactionError("Not enough allowance", (<RootState>getState()).transaction.currentStage)

            const preparedTransaction = await prepareWriteContract({
              address: payload.tokenAddress as any,
              abi: token_abi,
              functionName: "approve",
              args: [payClass.addressPermit, ethers.constants.MaxUint256]
            })

            const { wait } = await writeContract(preparedTransaction)
            await wait()

          }
          const allowancePermit = await payClass.AllowancePermit("A", "router");
          if (!allowancePermit ||
            weiToEthNum(allowancePermit.amount, payClass.tokenA.info.decimals[payload.chainId]) <
            payClass.tokenA.info.amountIn ||
            allowancePermit.expiration < Date.now() / 1000) {
            const dataForSign = payClass.dataForSign(allowancePermit?.nonce ?? 0)
            const signature = await signTypedData(dataForSign)

            // const isv = verifyTypedData(
            //   dataForSign.domain,
            //   dataForSign.types,
            //   dataForSign.value,
            //   sign.data
            // );



          }

        } else {
          const allowance = await payClass.checkAllowance("A", "router")
          if (weiToEthNum(allowance, payClass.tokenA.info.decimals[payload.chainId]) < payClass.tokenA.info.amountIn) {
            const preparedTransaction = await prepareWriteContract({
              address: payload.tokenAddress as any,
              abi: token_abi,
              functionName: "approve",
              args: [payClass.addressRouter, ethers.constants.MaxUint256]
            })

            const { wait } = await writeContract(preparedTransaction)
            await wait()
          }
        }
      }

      dispatch(setStageStatus({ stageId: 0, status: StageStatus.SUCCESS }));


      const contextFromTo: IContext = {
        from: payClass.tokenA.isNative ? "native" : "erc20",
        to: payClass.tokenB.isNative ? "native" : "erc20",
      }

      if (contextFromTo.to === contextFromTo.from) {
        const preparedTransaction = await prepareSendTransaction({
          request: {
            to: payload.polusContractAddress,
            value: payClass.tokenA.isNative ? payClass.tokenA.info.amountIn : 0,
            data: !(contextFromTo.from === "native" && contextFromTo.from === contextFromTo.to) ? doPayThroughPolusContract({
              uuid: payload.uuid,
              feeRecipient: payload.feeRecipient,
              fee: payload.fee,
              merchant: payload.addressMerchant,
              merchantAmount: payload.amounrInDecimalsWithoutFee,
              asset_amount_decimals: payload.amountInDecimalsWithFee,
              tokenAddress: payload.tokenAddress,
            }) : doPayThroughPolusContract({
              uuid: payload.uuid,
              feeRecipient: payload.feeRecipient,
              fee: payload.fee,
              merchant: payload.addressMerchant,
              merchantAmount: payload.amounrInDecimalsWithoutFee,
              asset_amount_decimals: payload.amountInDecimalsWithFee,
            })
          }
        })

        const { wait } = await sendTransaction(preparedTransaction);
        await wait();
      } else {

      }


    } catch (error) {
      console.error(error)

    }
  }
)





        // dispatch(setStage({ stageId: 1, text: "Native token", status: StageStatus.SUCCESS }));
