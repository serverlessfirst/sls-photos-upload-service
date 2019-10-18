
function getEnvString(key: string, required: boolean = false): string {
  const val = process.env[key];
  if (required && !val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val!;
}

export const STAGE = getEnvString('STAGE', true);

export const ddb = {
  MainTable: getEnvString('DYNAMODB_TABLE_MAIN'),
};

export const cognito = {
  userPoolId: getEnvString('COGNITO_USER_POOL_ID'),
  userPoolWebClientId: getEnvString('COGNITO_USER_POOL_WEB_CLIENT_ID'),
};

export const aws = {
  region: getEnvString('AWS_REGION'),
};

export const s3 = {
  photosBucket: getEnvString('S3_PHOTOS_BUCKET'),
};

export const cloudfront = {
  photosDistributionDomainName: getEnvString('CLOUDFRONT_PHOTOS_DOMAIN_NAME'),
};
