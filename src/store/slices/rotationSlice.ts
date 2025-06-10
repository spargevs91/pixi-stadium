import { createSlice } from '@reduxjs/toolkit';

interface RotationState {
    value: number;
}

const initialState: RotationState = {
    value: 0,
};

const rotationSlice = createSlice({
    name: 'rotation',
    initialState,
    reducers: {
        incrementRotation: (state, action: { payload: number }) => {
            state.value += action.payload;
        },
    },
});

export const { incrementRotation } = rotationSlice.actions;
export default rotationSlice.reducer;