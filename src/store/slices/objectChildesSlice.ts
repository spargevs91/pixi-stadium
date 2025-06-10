import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {GeneratedObject} from '../../utils/generateObjects'; // Используем существующий тип
import type {IGenerateObjectChildes} from "../../utils/generateObjectChildes.ts";

export interface IObjectChildesState {
    objectChildes: IGenerateObjectChildes[];
    selectedObject: GeneratedObject | null;
}

const initialState: IObjectChildesState = {
    objectChildes: [],
    selectedObject: null,
};

const objectChildesSlice = createSlice({
    name: 'objects',
    initialState,
    reducers: {
        setObjectChildes: (state, action: PayloadAction<IGenerateObjectChildes[]>) => {
            state.objectChildes = action.payload;
        },
        setSelectedObject: (state, action: PayloadAction<GeneratedObject | null>) => {
            state.selectedObject = action.payload;
        },
    },
});

export const { setObjectChildes, setSelectedObject } = objectChildesSlice.actions;
export default objectChildesSlice.reducer;