import React from 'react';
import styled from 'styled-components';
import { FileItem } from '../types/FileItem';
import {
  FiFile,
  FiFolder,
  FiDownload,
  FiTrash2,
  FiStar,
  FiImage,
  FiMusic,
  FiVideo,
  FiFileText,
  FiArchive
} from 'react-icons/fi';

const ListContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(143, 188, 143, 0.2);
`;

const ListHeader = styled.div`
  background: rgba(143, 188, 143, 0.1);
  padding: 15px 20px;
  border-bottom: 1px solid rgba(143, 188, 143, 0.2);
  display: grid;
  grid-template-columns: 1fr 100px 120px 120px 80px;
  gap: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ListItem = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid rgba(143, 188, 143, 0.1);
  display: grid;
  grid-template-columns: 1fr 100px 120px 120px 80px;
  gap: 20px;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(143, 188, 143, 0.05);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FileIcon = styled.div<{ type: string }>`
  font-size: 20px;
  color: ${props => {
    switch (props.type) {
      case 'folder': return '#90EE90';
      case 'image': return '#98FB98';
      case 'video': return '#8FBC8F';
      case 'audio': return '#9ACD32';
      case 'text': return '#ADFF2F';
      case 'archive': return '#7CFC00';
      default: return '#B0C4DE';
    }
  }};
`;

const FileName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  word-break: break-word;
`;

const FileSize = styled.div`
  font-size: 13px;
  color: #666;
`;

const FileDate = styled.div`
  font-size: 13px;
  color: #666;
`;

const FileActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: #666;
  font-size: 16px;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: #e9ecef;
    color: #333;
  }

  &.delete:hover {
    color: #e74c3c;
    background: #f8d7da;
  }
`;

const ListItemHover = styled.div`
  &:hover ${FileActions} {
    opacity: 1;
  }
`;

const getFileIcon = (file: FileItem) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (file.type === 'folder') {
    return <FiFolder />;
  }

  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
    case 'webp':
      return <FiImage />;
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
    case 'webm':
      return <FiVideo />;
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
    case 'ogg':
      return <FiMusic />;
    case 'txt':
    case 'doc':
    case 'docx':
    case 'pdf':
    case 'rtf':
      return <FiFileText />;
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return <FiArchive />;
    default:
      return <FiFile />;
  }
};

const getFileType = (file: FileItem): string => {
  if (file.type === 'folder') return 'folder';
  
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
    case 'webp':
      return 'image';
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
    case 'webm':
      return 'video';
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
    case 'ogg':
      return 'audio';
    case 'txt':
    case 'doc':
    case 'docx':
    case 'pdf':
    case 'rtf':
      return 'text';
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return 'archive';
    default:
      return 'file';
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (date: Date) => {
  if (!date || isNaN(date.getTime())) {
    return 'Неизвестно';
  }
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const formatTime = (date: Date) => {
  if (!date || isNaN(date.getTime())) {
    return '--:--';
  }
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

interface FileListProps {
  files: FileItem[];
  onFileClick: (file: FileItem) => void;
  onToggleFavorite: (fileId: string) => void;
  onMoveToTrash: (fileId: string) => void;
  onRestoreFromTrash: (fileId: string) => void;
  onPermanentDelete: (fileId: string) => void;
  currentPath: string;
}

const FileList: React.FC<FileListProps> = ({ 
  files, 
  onFileClick, 
  onToggleFavorite, 
  onMoveToTrash, 
  onRestoreFromTrash, 
  onPermanentDelete, 
  currentPath 
}) => {
  return (
    <ListContainer>
      <ListHeader>
        <div>Имя</div>
        <div>Размер</div>
        <div>Дата создания</div>
        <div>Изменен</div>
        <div>Действия</div>
      </ListHeader>
      
      {files.map((file) => {
        const fileType = getFileType(file);
        
        return (
          <ListItemHover key={file.id}>
            <ListItem onClick={() => onFileClick(file)}>
              <FileInfo>
                <FileIcon type={fileType}>
                  {getFileIcon(file)}
                </FileIcon>
                <FileName>{file.name}</FileName>
              </FileInfo>
              
              <FileSize>
                {file.type === 'file' && file.size ? formatFileSize(file.size) : '-'}
              </FileSize>
              
              <FileDate>{formatDate(file.createdAt)}</FileDate>
              
              <FileDate>{formatTime(file.modifiedAt)}</FileDate>
              
              <FileActions>
                <ActionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(file.id);
                  }}
                  title={file.isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
                  style={{ color: file.isFavorite ? '#f39c12' : '#666' }}
                >
                  <FiStar />
                </ActionButton>
                
                {currentPath === '/trash' ? (
                  <>
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestoreFromTrash(file.id);
                      }}
                      title="Восстановить"
                    >
                      <FiDownload />
                    </ActionButton>
                    
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onPermanentDelete(file.id);
                      }}
                      className="delete"
                      title="Удалить навсегда"
                    >
                      <FiTrash2 />
                    </ActionButton>
                  </>
                ) : (
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveToTrash(file.id);
                    }}
                    className="delete"
                    title="Удалить"
                  >
                    <FiTrash2 />
                  </ActionButton>
                )}
              </FileActions>
            </ListItem>
          </ListItemHover>
        );
      })}
    </ListContainer>
  );
};

export default FileList;
