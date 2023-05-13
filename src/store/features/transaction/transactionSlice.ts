import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { startPay } from './transactionThunk';

export interface TransactionState {
  stages: [IApproveStage, ISignStage, ISendStage]
  currentStage: StageId;
}

export type StageId = 0 | 1 | 2;

interface IApproveStage extends IStage { }
interface ISignStage extends IStage { }
interface ISendStage extends IStage { }


export const enum StageStatus {
  PENDING,
  LOADING,
  SUCCESS,
  FAILURE
}



interface IStage {
  status: StageStatus;
  statusText: string;
}




const initialState: TransactionState = {
  stages: [
    { status: StageStatus.PENDING, statusText: "Approve your tokens" },
    { status: StageStatus.PENDING, statusText: "Sign transaction" },
    { status: StageStatus.PENDING, statusText: "Sign your tokens" },
  ],
  currentStage: 1
}

export const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setStageText: (state, action: PayloadAction<{ stageId: StageId, text: string }>) => { },
    setStageStatus: (state, action: PayloadAction<{ stageId: StageId, status: StageStatus }>) => {
      state.stages[action.payload.stageId].status = action.payload.status;
    },
    setStage: (state, action: PayloadAction<{ stageId: StageId, status: StageStatus, text: string }>) => { },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startPay.pending, (state, action) => { })
      .addCase(startPay.fulfilled, (state, action) => { })
      .addCase(startPay.rejected, (state, action) => { })


  }
})

export const { setStageText, setStageStatus, setStage } = transactionSlice.actions
export default transactionSlice.reducer
