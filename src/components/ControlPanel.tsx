import { useSelector, useDispatch } from 'react-redux';
import type {RootState} from "../store/store.ts";
import {setObjectChildes, setSelectedObject} from "../store/slices/objectChildesSlice.ts";


export const ControlPanel = () => {
    const dispatch = useDispatch();
    const { objectChildes, selectedObject } = useSelector((state: RootState) => state.objectChildes);


    return (<div style={{width: "100%", height: "30px"}}>
        {!!selectedObject ? <span onClick={() => {
            dispatch(setObjectChildes([]));
            dispatch(setSelectedObject(null));
        }}>Вернуться в основное меню </span> : ""}
    </div>)
}