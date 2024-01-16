import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import * as serviceWorker from './serviceWorker';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { msalConfig } from './util/azureConf';
import { MsalProvider } from '@azure/msal-react';
import * as Sentry from '@sentry/react';

import { appProperties } from './util/appProperties';
import { FullStory, init as initFullStory } from '@fullstory/browser';
import { selectAccount } from './services/authService';
import CacheBuster from 'react-cache-buster';
import packageJson from '../package.json';
import PageLoader from './components/PageLoader';
import 'react-toastify/dist/ReactToastify.css';

const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.initialize().then(() => {
  const { version } = packageJson;
  initFullStory({ orgId: '15K2BV', devMode: appProperties.environment === 'development' });
  selectAccount(msalInstance);

  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
      const account = event.payload.account;
      msalInstance.setActiveAccount(account);
      if (account && account.username) {
        FullStory.setUserVars({ email: account.idTokenClaims.otherMails[0] });
      }
    }
  });
  Sentry.init({
    dsn: appProperties.dsn,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.BrowserTracing()],
    environment: appProperties.environment
  });
  ReactDOM.createRoot(document.getElementById('root')).render(
    <CacheBuster
      currentVersion={version}
      isEnabled={true} //If false, the library is disabled.
      isVerboseMode={false} //If true, the library writes verbose logs to console.
      loadingComponent={<PageLoader />} //If not pass, nothing appears at the time of new version check.
    >
      <MsalProvider instance={msalInstance}>
        <Sentry.ErrorBoundary fallback={'An error has occurred'} showDialog>
          <App instance={msalInstance} fullStoryInstance={FullStory} />
        </Sentry.ErrorBoundary>
      </MsalProvider>
    </CacheBuster>
  );

  serviceWorker.unregister();
});
