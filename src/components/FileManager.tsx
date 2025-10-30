import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styled, { keyframes } from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FileViewerModal from './FileViewerModal';
import { FileItem } from '../types/FileItem';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiUpload, 
  FiFolderPlus, 
  FiGrid, 
  FiList, 
  FiSearch,
  FiArrowLeft
} from 'react-icons/fi';
import FileGrid from './FileGridNew';
import FileList from './FileList';
import './FileManager.css';
import { formatBytes, formatDate, formatTime } from '../utils/format';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const FileManagerContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  backdrop-filter: blur(10px);
  border-radius: 15px;
  overflow: hidden;

  @media (max-width: 768px) {
    border-radius: 0;
    padding-bottom: 70px;
  }
`;

const Toolbar = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    padding: 10px;
    gap: 5px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  margin-left: 20px;
`;

const BreadcrumbItem = styled.span`
  color: #333;
  font-weight: 500;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
  color: #333;
  border: 1px solid #e1e5e9;

  &:hover {
    background: #e9ecef;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 10px 15px 10px 40px;
  border: 2px solid #e1e5e9;
  border-radius: 25px;
  font-size: 14px;
  width: 250px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #8FBC8F;
    box-shadow: 0 0 0 3px rgba(143, 188, 143, 0.1);
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 200px;
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 15px;
  color: #999;
  font-size: 16px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: linear-gradient(135deg, #8FBC8F 0%, #98FB98 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(143, 188, 143, 0.3);
    }
  }

  &.secondary {
    background: #f8f9fa;
    color: #333;
    border: 1px solid #e1e5e9;

    &:hover {
      background: #e9ecef;
    }
  }

  &.icon {
    padding: 10px;
    background: #f8f9fa;
    color: #666;
    border: 1px solid #e1e5e9;

    &:hover {
      background: #e9ecef;
      color: #333;
    }

    &.active {
      background: #8FBC8F;
      color: white;
    }
  }
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
`;

const ContentArea = styled.div<{ isDragActive: boolean }>`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  transition: all 0.3s ease;
  background: ${props => props.isDragActive ? 'rgba(143, 188, 143, 0.1)' : 'transparent'};
  border: ${props => props.isDragActive ? '2px dashed #8FBC8F' : '2px dashed transparent'};
  border-radius: 10px;
  margin: 0 20px 20px;
`;

const DropZoneOverlay = styled.div<{ isDragActive: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.1);
  display: ${props => props.isDragActive ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 15px;
`;

const DropZoneText = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const DropZoneIcon = styled(FiUpload)`
  font-size: 48px;
  color: #667eea;
  margin-bottom: 15px;
`;

const DropZoneTitle = styled.h3`
  font-size: 20px;
  color: #333;
  margin: 0 0 10px;
`;

const DropZoneSubtitle = styled.p`
  color: #666;
  margin: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const EmptyIcon = styled(FiUpload)`
  font-size: 64px;
  color: #ccc;
  margin-bottom: 20px;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  color: #333;
  margin: 0 0 10px;
`;

const EmptyText = styled.p`
  margin: 0;
`;

// Анимация и оверлей загрузки
const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;
const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(143,188,143,0.3);
  border-top-color: #8FBC8F;
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
`;

interface FileManagerProps {
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  currentPath: string;
  onPathChange: (path: string) => void;
  onGoBack: () => void;
  canGoBack: boolean;
}

const FileManager: React.FC<FileManagerProps> = ({ 
  files, 
  setFiles, 
  currentPath, 
  onPathChange,
  onGoBack,
  canGoBack
}) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // Новый стейт для модального окна создания папки
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const getCurrentFiles = () => {
    let currentFiles = files.filter(file => {
      // Исключаем удаленные файлы для обычных папок
      if (currentPath !== '/trash' && file.isDeleted) {
        return false;
      }

      if (currentPath === '/') {
        return !file.parentId;
      } else if (currentPath === '/favorites') {
        return file.isFavorite;
      } else if (currentPath === '/trash') {
        return file.isDeleted;
      }
      return file.path === currentPath;
    });

    if (searchQuery) {
      currentFiles = currentFiles.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return currentFiles;
  };

  const handleFileUpload = useCallback(async (acceptedFiles: File[]) => {
    if (!user?.apiKey) return;
    setIsUploading(true);
    setTotalFiles(acceptedFiles.length);
    setUploadProgress(0);
    
    try {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', currentPath);

        const response = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.apiKey}`
          },
          body: formData
        });

        const data = await response.json();
        
        if (data.success) {
          // Преобразуем ответ сервера в формат FileItem
          const newFile: FileItem = {
            id: data.file.id,
            name: data.file.name,
            type: data.file.type,
            size: data.file.size,
            path: data.file.path,
            createdAt: new Date(data.file.createdAt),
            modifiedAt: new Date(data.file.modifiedAt),
            parentId: data.file.parentId
          };
          
          setFiles((prevFiles: FileItem[]) => [...prevFiles, newFile]);
          // обновление прогресса
          setUploadProgress(Math.round(((i + 1) / acceptedFiles.length) * 100));
        } else {
          console.error('Ошибка загрузки файла:', data.error);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки файлов:', error);
    } finally {
      setIsUploading(false);
      setTotalFiles(0);
      setUploadProgress(0);
    }
  }, [user?.apiKey, currentPath, setFiles]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles);
      handleFileUpload(fileArray);
    }
    // Очищаем input для возможности повторного выбора того же файла
    event.target.value = '';
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    noClick: true,
    noKeyboard: true
  });

  const createFolder = async () => {
    if (!user?.apiKey) return;
    
    const folderName = prompt('Введите название папки:');
    if (folderName && folderName.trim()) {
      try {
        const response = await fetch(`${API_BASE_URL}/folders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: folderName.trim(),
            path: currentPath
          })
        });

        const data = await response.json();
        
        if (data.success) {
          // Преобразуем ответ сервера в формат FileItem
          const newFolder: FileItem = {
            id: data.folder.id,
            name: data.folder.name,
            type: data.folder.type,
            path: data.folder.path,
            createdAt: new Date(data.folder.createdAt),
            modifiedAt: new Date(data.folder.modifiedAt)
          };
          
          setFiles((prevFiles: FileItem[]) => [...prevFiles, newFolder]);
        } else {
          console.error('Ошибка создания папки:', data.error);
          alert('Ошибка создания папки: ' + data.error);
        }
      } catch (error) {
        console.error('Ошибка создания папки:', error);
        alert('Ошибка создания папки');
      }
    }
  };

  const toggleFavorite = (fileId: string) => {
    setFiles(files.map(file => 
      file.id === fileId 
        ? { ...file, isFavorite: !file.isFavorite, modifiedAt: new Date() }
        : file
    ));
  };

  const moveToTrash = (fileId: string) => {
    setFiles(files.map(file => 
      file.id === fileId 
        ? { ...file, isDeleted: true, modifiedAt: new Date() }
        : file
    ));
  };

  const restoreFromTrash = (fileId: string) => {
    setFiles(files.map(file => 
      file.id === fileId 
        ? { ...file, isDeleted: false, modifiedAt: new Date() }
        : file
    ));
  };

  const permanentDelete = (fileId: string) => {
    if (window.confirm('Вы уверены, что хотите навсегда удалить этот файл?')) {
      setFiles(files.filter(file => file.id !== fileId));
    }
  };

  // Открыть модалку
  const openCreateFolderModal = () => {
    setNewFolderName('');
    setIsCreatingFolder(true);
  };

  // Подтвердить создание папки
  const confirmCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.apiKey}` },
        body: JSON.stringify({ name: newFolderName, path: currentPath })
      });
      const data = await res.json();
      if (data.success && setFiles) {
        // Добавляем новую папку в список файлов
        const newFolder = {
          id: data.folder?.id || '',
          name: newFolderName,
          type: 'folder' as const,
          path: `${currentPath}/${newFolderName}`,
          createdAt: new Date(),
          modifiedAt: new Date()
        };
        setFiles([...files, newFolder]);
      }
    } catch (error) {
      console.error('Ошибка создания папки:', error);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Отмена создания
  const cancelCreateFolder = () => setIsCreatingFolder(false);

  // обработчик клика по файлу
  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      onPathChange(file.path);
    } else {
      setSelectedFile(file);
      setIsViewerOpen(true);
    }
  };

  const getBreadcrumb = () => {
    if (currentPath === '/') {
      return 'Главная';
    }
    
    const pathParts = currentPath.split('/').filter(Boolean);
    const breadcrumbItems = ['Главная'];
    
    pathParts.forEach(part => {
      const file = files.find(f => f.id === part);
      if (file) {
        breadcrumbItems.push(file.name);
      }
    });
    
    return breadcrumbItems.join(' / ');
  };

  const currentFiles = getCurrentFiles();

  // Переместить файл в существующую папку
  const moveFileToFolder = (fileId: string, folderId: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        const folder = prev.find(item => item.id === folderId && item.type === 'folder');
        const newPath = folder ? `${folder.path}` : f.path;
        return { ...f, path: newPath, parentId: folderId };
      }
      return f;
    }));
  };
  // Объединить два файла в новую папку
  const mergeFiles = (fileId: string, targetFileId: string) => {
    const newFolderName = 'Новая папка';
    const newFolderPath = `${currentPath}/${newFolderName}`;
    const newFolderId = uuidv4();
    const newFolder: FileItem = {
      id: newFolderId,
      name: newFolderName,
      type: 'folder',
      path: newFolderPath,
      createdAt: new Date(),
      modifiedAt: new Date()
    };
    setFiles(prev => [
      ...prev.map(f => {
        if (f.id === fileId || f.id === targetFileId) {
          return { ...f, path: newFolderPath, parentId: newFolderId };
        }
        return f;
      }),
      newFolder
    ]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <FileManagerContainer {...getRootProps()} className={isUploading ? 'uploading' : ''}>
        <input {...getInputProps()} />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />
        
        <Toolbar>
          <LeftSection>
            <BackButton onClick={onGoBack} disabled={!canGoBack}>
              <FiArrowLeft />
              Назад
            </BackButton>
            <Breadcrumb>
              <BreadcrumbItem>{getBreadcrumb()}</BreadcrumbItem>
            </Breadcrumb>
          </LeftSection>

          <RightSection>
            <Button className="primary" onClick={handleUploadClick} disabled={isUploading}>
              <FiUpload />
              {isUploading ? 'Загрузка...' : 'Загрузить файлы'}
            </Button>
            <Button className="secondary" onClick={openCreateFolderModal}>
              <FiFolderPlus /> Создать папку
            </Button>
            
            <SearchBox>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder="Поиск файлов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchBox>
            
            <ViewToggle>
              <Button 
                className={`icon ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid />
              </Button>
              <Button 
                className={`icon ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FiList />
              </Button>
            </ViewToggle>
          </RightSection>
        </Toolbar>

        {isUploading && (
          <LoadingOverlay>
            <Spinner />
            <div style={{marginTop: '12px', color: '#333', fontWeight: 500}}>{uploadProgress}%</div>
            <UploadProgressBarContainer>
              <UploadProgressBar percent={uploadProgress} />
            </UploadProgressBarContainer>
          </LoadingOverlay>
        )}

        <ContentArea isDragActive={isDragActive}>
          {isDragActive && (
            <DropZoneOverlay isDragActive={isDragActive}>
              <DropZoneText>
                <DropZoneIcon />
                <DropZoneTitle>Перетащите файлы сюда</DropZoneTitle>
                <DropZoneSubtitle>Отпустите, чтобы загрузить</DropZoneSubtitle>
              </DropZoneText>
            </DropZoneOverlay>
          )}

          {currentFiles.length === 0 && !isDragActive ? (
            <EmptyState>
              <EmptyIcon />
              <EmptyTitle>Папка пуста</EmptyTitle>
              <EmptyText>
                {searchQuery 
                  ? 'Файлы не найдены по вашему запросу'
                  : 'Загрузите файлы или создайте папку'
                }
              </EmptyText>
            </EmptyState>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <FileGrid 
                  files={currentFiles}
                  onFileClick={handleFileClick}
                  onToggleFavorite={toggleFavorite}
                  onMoveToTrash={moveToTrash}
                  onRestoreFromTrash={restoreFromTrash}
                  onPermanentDelete={permanentDelete}
                  currentPath={currentPath}
                  onMoveFile={moveFileToFolder}
                  onMergeFiles={mergeFiles}
                />
              ) : (
                <FileList 
                  files={currentFiles}
                  onFileClick={handleFileClick}
                  onToggleFavorite={toggleFavorite}
                  onMoveToTrash={moveToTrash}
                  onRestoreFromTrash={restoreFromTrash}
                  onPermanentDelete={permanentDelete}
                  currentPath={currentPath}
                />
              )}
            </>
          )}
        </ContentArea>
        {isCreatingFolder && (
          <ModalOverlay>
            <ModalContainer>
              <ModalTitle>Введите название папки</ModalTitle>
              <ModalInput 
                value={newFolderName} 
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="Название папки"
              />
              <ModalActions>
                <ModalButton onClick={confirmCreateFolder}>Создать</ModalButton>
                <ModalButton onClick={cancelCreateFolder}>Отмена</ModalButton>
              </ModalActions>
            </ModalContainer>
          </ModalOverlay>
        )}
        {/* Модальное окно просмотра файла */}
        <FileViewerModal
          isOpen={isViewerOpen}
          file={selectedFile}
          onClose={() => setIsViewerOpen(false)}
        />
      </FileManagerContainer>
    </DndProvider>
  );
};

export default FileManager;

// Стили модального окна
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  width: 300px;
`;

const ModalTitle = styled.h3`
  margin: 0 0 10px;
  color: #333;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ModalButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;

  &:first-child { background: #8FBC8F; color: #fff; }
  &:last-child { background: #ccc; color: #333; }
`;

const UploadProgressBarContainer = styled.div`
  width: 80%;
  height: 8px;
  background: #e1e5e9;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 16px;
`;
const UploadProgressBar = styled.div<{ percent: number }>`
  width: ${props => props.percent}%;
  height: 100%;
  background: #8FBC8F;
  transition: width 0.3s ease;
`;
