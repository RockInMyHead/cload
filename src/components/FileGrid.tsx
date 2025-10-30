import React from 'react';
import styled from 'styled-components';
import { FileItem } from '../types/FileItem';
import { 
  FiFile, 
  FiFolder, 
  FiDownload, 
  FiTrash2, 
  FiEdit3,
  FiStar,
  FiImage,
  FiMusic,
  FiVideo,
  FiFileText,
  FiArchive
} from 'react-icons/fi';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 10px 0;
`;

const FileCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
`;

const FileIcon = styled.div<{ type: string }>`
  font-size: 48px;
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
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
`;

const FileName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 8px;
  word-break: break-word;
  line-height: 1.4;
`;

const FileSize = styled.div`
  font-size: 12px;
  color: #666;
  text-align: center;
`;

const FileDate = styled.div`
  font-size: 11px;
  color: #999;
  text-align: center;
  margin-top: 5px;
`;

const FileActions = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  margin-left: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: white;
    color: #333;
    transform: scale(1.1);
  }

  &.delete:hover {
    color: #e74c3c;
  }
`;

const FileCardHover = styled.div`
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

interface FileGridProps {
  files: FileItem[];
  onFileClick: (file: FileItem) => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, currentName: string) => void;
}

const FileGrid: React.FC<FileGridProps> = ({ files, onFileClick, onDeleteFile, onRenameFile }) => {
  return (
    <GridContainer>
      {files.map((file) => {
        const fileType = getFileType(file);
        
        return (
          <FileCardHover key={file.id}>
            <FileCard onClick={() => onFileClick(file)}>
              <FileIcon type={fileType}>
                {getFileIcon(file)}
              </FileIcon>
              
              <FileName>{file.name}</FileName>
              
              {file.type === 'file' && file.size && (
                <FileSize>{formatFileSize(file.size)}</FileSize>
              )}
              
              <FileDate>{formatDate(file.createdAt)}</FileDate>
              
              <FileActions>
                <ActionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    // Добавить в избранное
                  }}
                  title="Добавить в избранное"
                >
                  <FiStar />
                </ActionButton>
                
                <ActionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenameFile(file.id, file.name);
                  }}
                  title="Переименовать"
                >
                  <FiEdit3 />
                </ActionButton>
                
                <ActionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    // Скачать файл
                  }}
                  title="Скачать"
                >
                  <FiDownload />
                </ActionButton>
                
                <ActionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(file.id);
                  }}
                  className="delete"
                  title="Удалить"
                >
                  <FiTrash2 />
                </ActionButton>
              </FileActions>
            </FileCard>
          </FileCardHover>
        );
      })}
    </GridContainer>
  );
};

export default FileGrid;
