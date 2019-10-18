import React, { Component } from 'react';
import { Auth, Hub } from 'aws-amplify';
import { CognitoUser } from 'amazon-cognito-identity-js';
import './App.css';
import OAuthButton from './components/Auth/OAuthButton';
import config from './config';
import PhotoUploader from './components/Photos/PhotoUploader';
import PhotosList from './components/Photos/PhotosList';

Auth.configure(config.amplify.Auth);

interface AppState {
  authState: string;
  user: CognitoUser | null;
  authData?: any;
  authError?: any;
}
interface AppProps { }

/* eslint react/no-unused-state: 0 */
class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    // let the Hub module listen on Auth events
    Hub.listen('auth', async data => {
      switch (data.payload.event) {
        case 'signIn':
          this.setState({ authState: 'signedIn', authData: data.payload.data });
          console.log('Signed in');
          break;
        case 'signIn_failure':
          this.setState({ authState: 'signIn', authData: null, authError: data.payload.data });
          console.log('Signin failure');
          break;
        default:
          break;
      }
    });
    this.state = { authState: 'loading', user: null };
  }

  async componentDidMount() {
    try {
      const user = await Auth.currentAuthenticatedUser();
      this.setState({ user, authState: 'signedIn' });
    } catch (error) {
      this.setState({ authState: 'signIn' });
    }
  }

  async signOut() {
    await Auth.signOut();
    this.setState({ authState: 'signIn' });
  }

  render() {
    const { authState } = this.state;
    const eventId = '1234';
    return (
      <div className="App">
        <header className="App-header">
          <h1>Photo Uploader Demo</h1>
          <div>
            {authState === 'loading' && (<div>loading...</div>)}
            {authState === 'signIn' && <OAuthButton />}
            {authState === 'signedIn' && <button onClick={() => this.signOut()}>Sign out</button>}
          </div>
          <div style={{ display: authState === 'signedIn' ? 'block' : 'none' }}>
            <PhotosList eventId={eventId} />
            <PhotoUploader eventId={eventId} />
          </div>
        </header>
      </div>
    );
  }
}

export default App;
