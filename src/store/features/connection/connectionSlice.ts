import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Blockchain_t } from "../../api/endpoints/types";

export interface ConnectionState {
    isActive: boolean;
    currentBlockchain: Blockchain_t | null;

}

const initialState: ConnectionState = {
    isActive: false,
    currentBlockchain: null
}

export const connectionSlice = createSlice({
    name: 'connection',
    initialState,
    reducers: {
        activateConnection: (state) => {
            state.isActive = true;
        },
        deactivateConnection: (state) => {
            state.isActive = false;
        },
        setCurrentBlockchain: (state, action: PayloadAction<Blockchain_t | null>) => {
            state.currentBlockchain = action.payload
        }
    },
})

export const { activateConnection, deactivateConnection, setCurrentBlockchain } = connectionSlice.actions

export default connectionSlice.reducer
