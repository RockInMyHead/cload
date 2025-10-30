import React from 'react';
import styled from 'styled-components';
import { FiX } from 'react-icons/fi';
import { FileItem } from '../types/FileItem';
import { useAuth } from '../contexts/AuthContext';
import { getApiBaseUrl } from '../utils/api';

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;
const Content = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 80%;
  max-height: 80%;
  overflow: auto;
  position: relative;
`;
const CloseBtn = styled.button`
  position: absolute;
  top: 10px; right: 10px;
  background: none; border: none;
  font-size: 20px; cursor: pointer;
`;
const Title = styled.h3`
  margin-top: 0; color: #333;
`;
const Stat = styled.div`
  font-size: 14px; color: #555; margin-bottom: 8px;
`;
const Preview = styled.div`
  margin-top: 16px;
  text-align: center;
  img, video { max-width: 100%; max-height: 60vh; }
  pre { text-align: left; white-space: pre-wrap; word-break: break-word; }
`;
interface Props {
  isOpen: boolean;
  file: FileItem | null;
  onClose: () => void;
}
const FileViewerModal: React.FC<Props> = ({ isOpen, file, onClose }) => {
  const { user } = useAuth();
  const apiKey = user?.apiKey;
  if (!isOpen || !file) return null;
  const formatDate = (d: Date) => d.toLocaleDateString('ru-RU');
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const API_BASE_URL = getApiBaseUrl();
  const url = `${API_BASE_URL}/download/${file.id}?apiKey=${apiKey}`;
  const rawUrl = `${API_BASE_URL}/files/${file.id}/raw?apiKey=${apiKey}`;
  // Используем API endpoint для изображения, чтобы гарантировать корректные CORS заголовки
  const imageUrl = `${API_BASE_URL}/files/${file.id}/image?apiKey=${apiKey}`;
  // Определяем тип по расширению
  const isImage = /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(file.name);
  const isVideo = /\.(mp4|webm|ogg)$/i.test(file.name);
  const isText = /\.(txt|md|json|js|ts|css|html)$/i.test(file.name);
  
  return (
    <Overlay>
      <Content>
        <CloseBtn onClick={onClose}><FiX /></CloseBtn>
        <Title>{file.name}</Title>
        <Stat>Размер: {formatBytes(file.size ?? 0)}</Stat>
        <Stat>Дата: {formatDate(file.modifiedAt)}</Stat>
        <Preview>
          {isImage && imageUrl && (
            <img src={imageUrl} alt={file.name} crossOrigin="anonymous" />
          )}
          {isVideo && <video controls src={url}></video>}
          {isText && rawUrl && (
            <pre style={{maxHeight:'60vh',overflow:'auto'}}>
              {/** Показываем сырой текст в iframe или в <code> */}
              <iframe
                src={rawUrl}
                style={{width:'100%',height:'60vh',border:'none'}}
                title={file.name}
              />
            </pre>
          )}
        {/* download button */}
        <button
          onClick={async () => {
            try {
              const response = await fetch(url);
              if (!response.ok) throw new Error('Download failed');

              const blob = await response.blob();
              const downloadUrl = window.URL.createObjectURL(blob);

              const a = document.createElement('a');
              a.href = downloadUrl;
              a.download = file.name;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);

              window.URL.revokeObjectURL(downloadUrl);
            } catch (error) {
              console.error('Download error:', error);
              alert('Ошибка при скачивании файла');
            }
          }}
          style={{
            padding: '10px 20px',
            background: '#8FBC8F',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            marginTop: '20px'
          }}
        >
          Скачать файл
        </button>
      </Preview>
    </Content>
  </Overlay>
);
};
export default FileViewerModal;
