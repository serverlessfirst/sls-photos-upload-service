import { S3Event } from 'aws-lambda';
import S3 from 'aws-sdk/clients/s3';
import log from '@common/utils/log';
import { EventPhotoCreate } from '@common/schemas/photos-api';
import { cloudfront } from '@svc-config';
import { savePhoto } from '@svc-models/event-photos';

const s3 = new S3();

export const handler = async (event: S3Event): Promise<void> => {
  const s3Record = event.Records[0].s3;

  // First fetch metadata from S3
  const s3Object = await s3.headObject({ Bucket: s3Record.bucket.name, Key: s3Record.object.key }).promise();
  if (!s3Object.Metadata) {
    // Shouldn't get here
    const errorMessage = 'Cannot process photo as no metadata is set for it';
    log.error(errorMessage, { s3Object, event });
    throw new Error(errorMessage);
  }
  // S3 metadata fields are all lowercase, so need to map them out carefully
  const photoDetails: EventPhotoCreate = {
    eventId: s3Object.Metadata.eventid,
    description: s3Object.Metadata.description,
    title: s3Object.Metadata.title,
    id: s3Object.Metadata.photoid,
    contentType: s3Object.Metadata.contenttype,
    // Map the S3 bucket key to a CloudFront URL to be stored in the DB
    url: `https://${cloudfront.photosDistributionDomainName}/${s3Record.object.key}`,
  };

  photoDetails.url = `https://${cloudfront.photosDistributionDomainName}/${s3Record.object.key}`;
  // Now write to DDB
  await savePhoto(photoDetails);
};
