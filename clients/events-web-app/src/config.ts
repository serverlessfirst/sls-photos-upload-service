export default {
  amplify: {
    Auth: {
      // REQUIRED - Amazon Cognito Region
      region: process.env.REACT_APP_AWS_REGION,

      // OPTIONAL - Amazon Cognito User Pool ID
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,

      // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      userPoolWebClientId: process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID,

      // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
      mandatorySignIn: false,

      // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
      // authenticationFlowType: 'USER_PASSWORD_AUTH',

      // Settings for accessing HostedUI
      oauth: {
        domain: process.env.REACT_APP_COGNITO_HOSTED_LOGIN_DOMAIN,
        scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
        redirectSignIn: 'http://localhost:3000/', // TODO: update this to point to CloudFront/S3 bucket domain in dev account
        redirectSignOut: 'http://localhost:3000/', // TODO: update this to point to CloudFront/S3 bucket domain in dev account
        responseType: 'code', // or 'token', note that REFRESH token will only be generated when the responseType is code
      },
    },
    API: {
      endpoints: [
        {
          name: 'PhotosAPI',
          endpoint: process.env.REACT_APP_PHOTOS_API_ENDPOINT_URL,
        },
      ],
    },
  },
};
