import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {IGeneratedObject} from '../../utils/generateObjects'; // Используем существующий тип
// Используем существующий тип
import type { PIXI } from 'pixi.js';

// Тип для прямоугольника PixiJS
type PixiRect = {
    graphic: PIXI.Graphics;
    status: string;
};

interface ObjectsState {
    objects: IGeneratedObject[];
    selectedRect: PixiRect | null;
}

const initialState: ObjectsState = {
    objects: [],
    selectedRect: null,
};

const objectsSlice = createSlice({
    name: 'objects',
    initialState,
    reducers: {
        setObjects: (state, action: PayloadAction<IGeneratedObject[]>) => {
            state.objects = action.payload;
        },
        setSelectedRect: (state, action: PayloadAction<PixiRect | null>) => {
            state.selectedRect = action.payload;
        },
    },
});

export const { setObjects, setSelectedRect } = objectsSlice.actions;
export default objectsSlice.reducer;