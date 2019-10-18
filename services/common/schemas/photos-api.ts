import { TimestampedEntity } from '@common/utils/dynamono/entity-mapper';

export interface PhotoMetadata {
  title: string;
  description: string;
  contentType: string;
}

export interface EventPhotoKeyFields {
  id: string;
  eventId: string;
}

export interface EventPhotoCreate extends PhotoMetadata, EventPhotoKeyFields {
  url: string;
}
export interface EventPhoto extends EventPhotoCreate, TimestampedEntity {
}

export type GetPhotosResponse = EventPhoto[];

export interface InitiateEventPhotoUploadRequest extends PhotoMetadata {}

export interface InitiateEventPhotoUploadResponse {
  photoId: string;
  /**
     * URL that a HTTP PUT request should be sent to in order to upload the photo content.
     */
  s3PutObjectUrl: string;
}
