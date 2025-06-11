import { v4 as uuidv4 } from 'uuid';

// Определение типов
export type Status = 'st1' | 'st2' | 'st3' | 'st4' | 'st5';

export interface IGeneratedObject {
    guid: string;
    name: string;
    status: Status;
    color: string;
}

// Карта статусов и цветов
const statusColors: Record<Status, string> = {
    st1: '#00FF00', // Зеленый
    st2: '#0000FF', // Синий
    st3: '#FFFF00', // Желтый
    st4: '#FFA500', // Оранжевый
    st5: '#FF0000', // Красный
};

// Массив статусов для случайного выбора
const statuses: Status[] = ['st1', 'st2', 'st3', 'st4', 'st5'];

// Функция для генерации массива объектов
export const generateObjects = (count: number): GeneratedObject[] => {
    const objects: GeneratedObject[] = [];

    // Генерация объектов
    for (let i = 0; i < count; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        objects.push({
            guid: uuidv4(),
            name: `AS ${i}`,
            status,
            color: statusColors[status],
        });
    }

    // Сортировка по статусу (от st1 до st5)
    return objects.sort((a, b) => {
        const statusOrder = statuses.indexOf(a.status) - statuses.indexOf(b.status);
        return statusOrder;
    });
};