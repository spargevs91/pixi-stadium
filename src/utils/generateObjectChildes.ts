import { v4 as uuidv4 } from 'uuid';

export interface IGenerateObjectChildes {
    guid: string;
    name: string;
    color: string;
    parentGuid: string;
}

/**
 * @function generateObjects
 * @description Генерирует массив из 150 объектов с полями guid, name и color.
 * @returns {Object[]} Массив объектов с уникальными идентификаторами, именами и случайными цветами.
 */
export const generateObjectChildes = (parentGuid: string): IGenerateObjectChildes[] => {
    const objects = [];
    for (let i = 0; i < 100; i++) {
        const color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
        objects.push({
            guid: uuidv4(),
            name: `Child ${i + 1}`,
            color,
            parentGuid
        });
    }
    return objects;
};