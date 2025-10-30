// Демонстрационные данные для тестирования приложения
import { FileItem } from '../types/FileItem';

export const demoFiles: FileItem[] = [
  {
    id: 'demo-folder-1',
    name: 'Документы',
    type: 'folder',
    path: '/',
    createdAt: new Date(),
    modifiedAt: new Date()
  },
  {
    id: 'demo-folder-2',
    name: 'Изображения',
    type: 'folder',
    path: '/',
    createdAt: new Date(),
    modifiedAt: new Date()
  },
  {
    id: 'demo-file-1',
    name: 'Презентация.pptx',
    type: 'file',
    size: 2048576, // 2MB
    path: '/',
    createdAt: new Date(),
    modifiedAt: new Date()
  },
  {
    id: 'demo-file-2',
    name: 'Отчет.pdf',
    type: 'file',
    size: 1024000, // 1MB
    path: '/',
    createdAt: new Date(),
    modifiedAt: new Date()
  },
  {
    id: 'demo-file-3',
    name: 'Фото.jpg',
    type: 'file',
    size: 512000, // 512KB
    path: '/',
    createdAt: new Date(),
    modifiedAt: new Date()
  },
  {
    id: 'demo-file-4',
    name: 'Музыка.mp3',
    type: 'file',
    size: 4096000, // 4MB
    path: '/',
    createdAt: new Date(),
    modifiedAt: new Date()
  }
];

// Функция для загрузки демо-данных
export const loadDemoData = (userId: string): FileItem[] => {
  const savedFiles = localStorage.getItem(`windexs_files_${userId}`);
  if (!savedFiles) {
    // Возвращаем пустой массив вместо демо-файлов
    localStorage.setItem(`windexs_files_${userId}`, JSON.stringify([]));
    return [];
  }
  
  // Парсим файлы и восстанавливаем объекты Date
  const parsedFiles = JSON.parse(savedFiles);
  return parsedFiles.map((file: any) => ({
    ...file,
    createdAt: new Date(file.createdAt),
    modifiedAt: new Date(file.modifiedAt)
  }));
};
