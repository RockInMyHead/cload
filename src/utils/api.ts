// Центральная утилита для определения API URL
export const getApiBaseUrl = (): string => {
  // Если установлена переменная окружения, используем её
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Динамическое определение URL на основе текущего хоста
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${protocol}//${hostname}${port}/api`;
  }

  // Fallback для SSR или других случаев
  return 'http://localhost:3001/api';
};

export const API_BASE_URL = getApiBaseUrl();
