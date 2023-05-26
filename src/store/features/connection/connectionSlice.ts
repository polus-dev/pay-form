import { createSlice } from '@reduxjs/toolkit'

export interface ConnectionState {
    isActive: boolean;

}

const initialState: ConnectionState = {
    isActive: false,
}

export const connectionSlice = createSlice({
    name: 'connection',
    initialState,
    reducers: {
        activateConnection: (state) => {
            state.isActive = true;
        },
        deactivateConnection : (state) => {
            state.isActive = false;
        },
    },
})

export const { activateConnection, deactivateConnection} = connectionSlice.actions

export default connectionSlice.reducer