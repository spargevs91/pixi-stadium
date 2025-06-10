import React from 'react';
import type {GeneratedObject} from '../utils/generateObjects';

// Стили для модального окна
const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    fontFamily: 'Arial, sans-serif',
    color: '#333',
};

const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
};

const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#666',
};

interface ObjectCardModalProps {
    object: GeneratedObject;
    modalWidth: number;
    modalHeight: number;
    onClose: () => void;
}

const ObjectCardModal: React.FC<ObjectCardModalProps> = ({ object, modalWidth, modalHeight, onClose }) => {
    return (
        <>
            <div style={overlayStyle} onClick={onClose} />
            <div
                style={{
                    ...modalStyle,
                    width: `${modalWidth}px`,
                    height: `${modalHeight}px`,
                    overflowY: 'auto',
                }}
            >
                <button style={closeButtonStyle} onClick={onClose}>
                    ✕
                </button>
                <h2>Карточка объекта</h2>
                <p><strong>GUID:</strong> {object.guid}</p>
                <p><strong>Цвет:</strong> {object.color}</p>
                <p><strong>Статус:</strong> {object.status}</p>
            </div>
        </>
    );
};

export default ObjectCardModal;