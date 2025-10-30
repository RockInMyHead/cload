import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useDrag, useDrop } from 'react-dnd';
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
import FilePreview from './FilePreview';
import '../components/FileManager.css';
import { formatBytes, formatDate } from '../utils/format';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 10px 0;
`;

const FileCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(143, 188, 143, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    border-color: rgba(143, 188, 143, 0.4);
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

// Компонент для предпросмотра изображений в сетке
const ImageIcon = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
`;

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

const ITEM_TYPE = 'FILE';

// Расширяем интерфейс
interface FileGridProps {
  files: FileItem[];
  onFileClick: (file: FileItem) => void;
  onToggleFavorite: (fileId: string) => void;
  onMoveToTrash: (fileId: string) => void;
  onRestoreFromTrash: (fileId: string) => void;
  onPermanentDelete: (fileId: string) => void;
  currentPath: string;
  onMoveFile: (fileId: string, folderId: string) => void;
  onMergeFiles: (fileId: string, targetFileId: string) => void;
}

// Компонент карточки с drag&drop
const DraggableFileCard: React.FC<{
  file: FileItem;
  fileType: string;
  isImage: boolean;
  onFileClick: (file: FileItem) => void;
  onToggleFavorite: (fileId: string) => void;
  onMoveToTrash: (fileId: string) => void;
  onRestoreFromTrash: (fileId: string) => void;
  onPermanentDelete: (fileId: string) => void;
  onMoveFile: (fileId: string, folderId: string) => void;
  onMergeFiles: (fileId: string, targetFileId: string) => void;
  currentPath: string;
}> = ({ file, fileType, isImage, onFileClick, onToggleFavorite, onMoveToTrash, onRestoreFromTrash, onPermanentDelete, onMoveFile, onMergeFiles, currentPath }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({ type: ITEM_TYPE, item: { id: file.id }, collect: m => ({ isDragging: m.isDragging() }) });
  const [, drop] = useDrop({ accept: ITEM_TYPE, drop: (item: {id: string}) => {
      if (file.type === 'folder') onMoveFile(item.id, file.id);
      else onMergeFiles(item.id, file.id);
    }
  });
  React.useEffect(() => { drag(drop(ref.current)); }, [drag, drop]);
  return (
    <FileCardHover ref={ref} className={isDragging ? 'dragging' : ''} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <FileCard onClick={() => onFileClick(file)}>
        {isImage && file.previewUrl ? <ImageIcon src={file.previewUrl} alt={file.name} /> : <FileIcon type={fileType}>{getFileIcon(file)}</FileIcon>}
        <FileName>{file.name}</FileName>
        {file.type === 'file' && file.size && <FileSize>{formatBytes(file.size)}</FileSize>}
        <FileDate>{formatDate(file.createdAt)}</FileDate>
        <FileActions>
          {currentPath === '/trash' ? (
            <>
              <ActionButton onClick={e => { e.stopPropagation(); onRestoreFromTrash(file.id); }} title="Восстановить из корзины"><FiDownload /></ActionButton>
              <ActionButton onClick={e => { e.stopPropagation(); onPermanentDelete(file.id); }} title="Удалить из корзины" className="delete"><FiTrash2 /></ActionButton>
            </>
          ) : (
            <>
              <ActionButton onClick={e => { e.stopPropagation(); onToggleFavorite(file.id); }} title={file.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'} style={{ color: file.isFavorite ? '#f39c12' : '#666' }}><FiStar /></ActionButton>
              <ActionButton onClick={e => { e.stopPropagation(); onMoveToTrash(file.id); }} title="Переместить в корзину" className="delete"><FiTrash2 /></ActionButton>
            </>
          )}
        </FileActions>
      </FileCard>
    </FileCardHover>
  );
};

const FileGrid: React.FC<FileGridProps> = ({ 
  files, onFileClick, onToggleFavorite, onMoveToTrash, onRestoreFromTrash, onPermanentDelete, currentPath, onMoveFile, onMergeFiles
}) => {
  return (
    <GridContainer>
      {files.map(file => {
        const fileType = getFileType(file);
        const isImage = Boolean(file.name.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i));
        return (
          <DraggableFileCard
            key={file.id}
            file={file}
            fileType={fileType}
            isImage={isImage}
            onFileClick={onFileClick}
            onToggleFavorite={onToggleFavorite}
            onMoveToTrash={onMoveToTrash}
            onRestoreFromTrash={onRestoreFromTrash}
            onPermanentDelete={onPermanentDelete}
            onMoveFile={onMoveFile}
            onMergeFiles={onMergeFiles}
            currentPath={currentPath}
          />
        );
      })}
    </GridContainer>
  );
};

export default FileGrid;
