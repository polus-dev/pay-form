import { StageStatus } from "../store/features/transaction/transactionSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { Stage } from "./Stage";
import { useEffect } from "react";
import { startPay } from "../store/features/transaction/transactionThunk";
import { Token } from "../store/api/types";
import { Blockchain_t } from "../store/api/endpoints/types";

interface ProcessBlockProps {
  id: string
  setAbortTransaction: { current: any | null };
  userToken: Token;
  merchantToken: Token;
  consoleLog: (message: any, type?: boolean) => void;
  uuid: string;
  blockchain: Blockchain_t
  userAddress: string
  amount: string
  fee: string;
  feeAddress: string;
  merchantAddress: string;
  merchantAmount: string;
  expireAt: string;
}


export const ProcessBlock = (props: ProcessBlockProps) => {
  const stages = useAppSelector((state) => state.transaction.stages);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const abortPromise = dispatch(startPay(props));
    props.setAbortTransaction.current = abortPromise.abort;
  }, []);
  return (
    <div id={props.id} className="proccess-block">
      {stages.map((stage, index) => (
        <Stage
          key={index}
          text={stage.statusText}
          isError={stage.status === StageStatus.FAILURE}
          disabled={stage.status === StageStatus.PENDING}
          isLoading={stage.status === StageStatus.LOADING}
          isSuccsess={stage.status === StageStatus.SUCCESS}
          isPending={stage.status === StageStatus.PENDING}
          onClick={() => dispatch(startPay({ ...props, targetStages: [index] }))}
        />
      ))}
    </div>
  );
};
