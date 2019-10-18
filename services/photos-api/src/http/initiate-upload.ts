import S3 from 'aws-sdk/clients/s3';
import uuid from 'uuid/v4';
import { InitiateEventPhotoUploadResponse, PhotoMetadata } from '@common/schemas/photos-api';
import { isValidImageContentType, getSupportedContentTypes, getFileSuffixForContentType } from '@svc-utils/image-mime-types';
import { s3 as s3Config } from '@svc-config';
import { wrap } from '@common/middleware/apigw';
import { StatusCodeError } from '@common/utils/errors';

const s3 = new S3();

export const handler = wrap(async (event) => {
    // Read metadata from path/body and validate
  const eventId = event.pathParameters!.eventId;
  const body = JSON.parse(event.body || '{}');
  const photoMetadata: PhotoMetadata = {
    contentType: body.contentType,
    title: body.title,
    description: body.description,
  };
  if (!isValidImageContentType(photoMetadata.contentType)) {
    throw new StatusCodeError(400, `Invalid contentType for image. Valid values are: ${getSupportedContentTypes().join(',')}`);
  }
  // TODO: Add any further business logic validation here (e.g. that current user has write access to eventId)

  // Create the PutObjectRequest that will be embedded in the signed URL
  const photoId = uuid();
  const req: S3.Types.PutObjectRequest = {
    Bucket: s3Config.photosBucket,
    Key: `uploads/event_${eventId}/${photoId}.${getFileSuffixForContentType(photoMetadata.contentType)!}` ,
    ContentType: photoMetadata.contentType,
    CacheControl: 'max-age=31557600',  // instructs CloudFront to cache for 1 year
    // Set Metadata fields to be retrieved post-upload and stored in DynamoDB
    Metadata: {
      ...(photoMetadata as any),
      photoId,
      eventId,
    },
  };
  // Get the signed URL from S3 and return to client
  const s3PutObjectUrl = await s3.getSignedUrlPromise('putObject', req);
  const result: InitiateEventPhotoUploadResponse = {
    photoId,
    s3PutObjectUrl,
  };
  return {
    statusCode: 201,
    body: JSON.stringify(result),
  };
});
