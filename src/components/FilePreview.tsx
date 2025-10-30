import React from 'react';
import styled from 'styled-components';
import { FileItem } from '../types/FileItem';

const ImagePreview = styled.div`
  width: 100%;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImageIcon = styled.div`
  font-size: 32px;
  color: #ccc;
`;

interface FilePreviewProps {
  file: FileItem;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  const isImage = file.name.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i);
  
  if (isImage && file.previewUrl) {
    return (
      <ImagePreview>
        <PreviewImage 
          src={file.previewUrl} 
          alt={file.name}
          onError={(e) => {
            // Если изображение не загрузилось, скрываем его
            e.currentTarget.style.display = 'none';
          }}
        />
      </ImagePreview>
    );
  }
  
  return (
    <ImagePreview>
      <ImageIcon>📁</ImageIcon>
    </ImagePreview>
  );
};

export default FilePreview;

