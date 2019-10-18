import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadPhoto } from '../../utils/photos-api-client';

const PhotoUploader: React.FC<{ eventId: string }> = ({ eventId }) => {
  const onDrop = useCallback(async (files: File[]) => {
    console.log('starting upload', { files });
    const file = files[0];
    try {
      const uploadResult = await uploadPhoto(eventId, file, {
        // should enhance this to read title and description from text input fields.
        title: 'my title',
        description: 'my description',
        contentType: file.type,
      });
      console.log('upload complete!', uploadResult);
      return uploadResult;
    } catch (error) {
      console.error('Error uploading', error);
      throw error;
    }
  }, [eventId]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {
        isDragActive
          ? <p>Drop the files here ...</p>
          : <p>Drag and drop some files here, or click to select files</p>
      }
    </div>
  );
};

export default PhotoUploader;
