// Продакшн-адреса сервера. Скопируйте этот файл в server.ts и подставьте свои.
//
//   cp src/config/server.example.ts src/config/server.ts
//
// server.ts — в .gitignore, в публичный репозиторий не попадает.
// Приложение берёт эти значения как значения по умолчанию, поэтому
// собеседникам не нужно вводить адреса вручную.

export const EMBEDDED_SERVER = 'meet.example.ru';
export const EMBEDDED_AUTH_URL = 'https://auth.example.ru';
