import { configureStore } from '@reduxjs/toolkit';
import rotationReducer from './slices/rotationSlice';
import objectsReducer from './slices/objectsSlice';
import objectChildesReducer from './slices/objectChildesSlice.ts';

export const store = configureStore({
    reducer: {
        rotation: rotationReducer,
        objects: objectsReducer,
        objectChildes: objectChildesReducer,
    },
});

export type IRootState = ReturnType<typeof store.getState>;
export type IAppDispatch = typeof store.dispatch;