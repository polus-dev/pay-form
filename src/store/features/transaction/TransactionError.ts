import { StageId } from "./transactionSlice";

export class TransactionError extends Error {
  constructor(message: string, public stageid: StageId) {
    super(message);
    this.name = "TransactionError";
  }
}
