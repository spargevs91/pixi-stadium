**Шаги для добавления Module Federation**

-   **Установка необходимых зависимостей**

    -   Убедитесь, что у вас установлен Node.js версии 18+ или 20+
        > (рекомендуется проверить совместимость в документации Vite).

    -   Установите плагин Module Federation как зависимость разработки:

    -   bash

    -   npm install \--save-dev \@originjs/vite-plugin-federation

    -   Или, если вы предпочитаете более новую версию:

    -   bash

    -   npm install \--save-dev \@module-federation/vite

    -   Убедитесь, что у вас установлены зависимости React 18:

    -   bash

    -   npm install react react-dom

-   **Обновление конфигурации Vite (**vite.config.js**)**

    -   Откройте или создайте файл vite.config.js в корне проекта.

    -   Добавьте плагин federation и настройте его в зависимости от
        > того, будет ли ваш проект выступать в роли **Host**
        > (хост-приложения, которое загружает удалённые модули) или
        > **Remote** (удалённого приложения, которое экспортирует
        > модули).

-   **Пример для Remote (удалённое приложение):**

    -   Это приложение будет экспортировать компоненты для использования
        > другими приложениями.

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
    plugins: [
        react(),
        federation({
            name: 'remoteApp', // Уникальное имя вашего приложения
            filename: 'remoteEntry.js', // Файл точки входа для удалённого модуля
            exposes: {
                './Button': './src/components/Button', // Путь к экспортируемому компоненту
            },
            shared: ['react', 'react-dom'], // Общие зависимости
        }),
    ],
    build: {
        target: 'esnext', // Поддержка top-level await
    },
    server: {
        port: 5001, // Порт для разработки
        headers: {
            'Access-Control-Allow-Origin': '*', // Разрешить CORS для разработки
        },
    },
});
```

**Пример для Host (хост-приложение):**
Это приложение будет динамически загружать компоненты из удалённых приложений.

- Это приложение будет динамически загружать компоненты из удалённых приложений.

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
    plugins: [
        react(),
        federation({
            name: 'hostApp', // Уникальное имя хоста
            remotes: {
                remoteApp: 'http://localhost:5001/assets/remoteEntry.js', // URL удалённого модуля
            },
            shared: ['react', 'react-dom'], // Общие зависимости
        }),
    ],
    build: {
        target: 'esnext', // Поддержка top-level await
    },
    server: {
        port: 5000, // Порт для разработки
        headers: {
            'Access-Control-Allow-Origin': '*', // Разрешить CORS
        },
    },
});
```
