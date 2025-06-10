import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PixiCanvas from './components/PixiCanvas';
import { generateObjects } from './utils/generateObjects';
import { setObjects } from './store/slices/objectsSlice';
import styles from './styles/App.module.scss';
import {ControlPanel} from "./components/ControlPanel.tsx";

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        const generatedObjects = generateObjects(5000);
        dispatch(setObjects(generatedObjects));
    }, [dispatch]);

    return (
        <div className={styles.app}>
            <PixiCanvas />
        </div>
    );
}

export default App;