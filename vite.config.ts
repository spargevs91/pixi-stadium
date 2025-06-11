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