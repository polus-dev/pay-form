import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface TransactionState {
  stages: Stage[]
}

interface Stage {
  status: StageStatus;
  statusText: string;
  currentStage: number;
}

const enum StageStatus {
  PENDING,
  LOADING,
  SUCCESS,
  FAILURE
}



const swap = createAsyncThunk(
  'transaction/swap',
  async (payload: { from: string, to: string, amount: number }) => { }
)

interface Context {
  from: TokenType;
  to: TokenType;
}


type TokenType = "native" | "erc20";


const initialState: TransactionState = {
  stages: []
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {

  },
})


export default counterSlice.reducer
