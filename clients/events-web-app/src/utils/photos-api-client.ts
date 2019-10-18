import { API, Auth } from 'aws-amplify';
import axios, { AxiosResponse } from 'axios';
import config from '../config';
import { PhotoMetadata, InitiateEventPhotoUploadResponse, EventPhoto } from '../../../../services/common/schemas/photos-api';

API.configure(config.amplify.API);

const API_NAME = 'PhotosAPI';

async function getHeaders(): Promise<any> {
  // Set auth token headers to be passed in all API requests
  const headers: any = { };
  const session = await Auth.currentSession();
  if (session) {
    headers.Authorization = `${session.getIdToken().getJwtToken()}`;
  }
  return headers;
}

export async function getPhotos(eventId: string): Promise<EventPhoto[]> {
  return API.get(API_NAME, `/events/${eventId}/photos`, { headers: await getHeaders() });
}

export async function uploadPhoto(
  eventId: string, photoFile: any, metadata: PhotoMetadata,
): Promise<AxiosResponse> {
  const initiateResult: InitiateEventPhotoUploadResponse = await API.post(
    API_NAME, `/events/${eventId}/photos/initiate-upload`, { body: metadata, headers: await getHeaders() },
  );
  return axios.put(initiateResult.s3PutObjectUrl, photoFile, {
    headers: {
      'Content-Type': metadata.contentType,
    },
  });
}
