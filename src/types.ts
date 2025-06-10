import type {IObjectChildesState} from "./store/slices/objectChildesSlice.ts";

export interface GeneratedObject {
    id: number;
    color: string;
    status: string;
}

export interface ObjectsState {
    objects: GeneratedObject[];
}

// Новый интерфейс для состояния фильтра
export interface StatusFilterState {
    selectedStatuses: string[];
}

export interface RootState {
    objectChildes: IObjectChildesState;
    objects: ObjectsState;
    statusFilter: StatusFilterState;
}