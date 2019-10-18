import { withOAuth } from 'aws-amplify-react';
import React, { Component } from 'react';

interface OAuthButtonProps {
  OAuthSignIn: any;
}
class OAuthButton extends Component<OAuthButtonProps> {
  render() {
    const { OAuthSignIn } = this.props;
    return (
      <button onClick={() => OAuthSignIn()}>
        Sign in with AWS
      </button>
    );
  }
}

export default withOAuth(OAuthButton);
