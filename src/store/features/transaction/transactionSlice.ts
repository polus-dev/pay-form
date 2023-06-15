import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { startPay } from "./transactionThunk";

export interface TransactionState {
  stages: [IApproveStage, ISignStage, ISendStage];
  currentStage: StageId;
  pathTrade: {
    path: any; // TODO
    amount?: string;
  };
}

export type StageId = 0 | 1 | 2;

interface IApproveStage extends IStage {}
interface ISignStage extends IStage {}
interface ISendStage extends IStage {}

export const enum StageStatus {
  PENDING,
  LOADING,
  SUCCESS,
  FAILURE,
}

interface IStage {
  status: StageStatus;
  statusText: string;
}

export const DEFAULT_STAGE_TEXT: { [key in StageId]: string } = {
  0: "Approve your tokens",
  1: "Sign transaction",
  2: "Sign your tokens",
};

const initialState: TransactionState = {
  stages: [
    { status: StageStatus.PENDING, statusText: DEFAULT_STAGE_TEXT[0] },
    { status: StageStatus.PENDING, statusText: DEFAULT_STAGE_TEXT[1] },
    { status: StageStatus.PENDING, statusText: DEFAULT_STAGE_TEXT[2] },
  ],
  currentStage: 0,
  pathTrade: {
    path: "",
  },
};

export const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    setStageText: (
      state,
      action: PayloadAction<{ stageId: StageId; text: string }>
    ) => {
      state.stages[action.payload.stageId].statusText = action.payload.text;
    },
    setStageStatus: (
      state,
      action: PayloadAction<{ stageId: StageId; status: StageStatus }>
    ) => {
      state.stages[action.payload.stageId].status = action.payload.status;
    },
    setStage: (
      state,
      action: PayloadAction<{
        stageId: StageId;
        status: StageStatus;
        text: string;
      }>
    ) => {
      state.stages[action.payload.stageId].status = action.payload.status;
      state.stages[action.payload.stageId].statusText = action.payload.text;
    },
    nextStage: (state) => {
      state.currentStage += 1;
    },
    setPathTrade: (
      state,
      action: PayloadAction<{ path: any; amount: string }>
    ) => {
      state.pathTrade = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startPay.pending, (state) => {
        state.currentStage = initialState.currentStage;
        state.stages = initialState.stages;
      })
      // .addCase(startPay.fulfilled, state => { })
      .addCase(startPay.rejected, (state, action) => {
        if (action.error.name === "AbortError") {
          return;
        }
        state.stages[state.currentStage].status = StageStatus.FAILURE;
        state.stages[state.currentStage].statusText =
          initialState.stages[state.currentStage].statusText;
        console.error(action.payload);
      });
  },
});

export const {
  setStageText,
  setStageStatus,
  setStage,
  nextStage,
  setPathTrade,
} = transactionSlice.actions;
export default transactionSlice.reducer;
