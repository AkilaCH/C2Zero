import { MsalAuthenticationTemplate } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../util/azureConf';
import PageLoader from './PageLoader';

function ErrorComponent({ error }) {
  const navigate = useNavigate();
  if (error.errorCode === 'server_error') {
    navigate('/');
  }
  return null;
}

export const AuthInteceptor = (props) => {
  const authRequest = {
    ...loginRequest
  };

  return (
    <MsalAuthenticationTemplate
      interactionType={InteractionType.Redirect}
      authenticationRequest={authRequest}
      loadingComponent={PageLoader}
      errorComponent={ErrorComponent}
    >
      {props.children}
    </MsalAuthenticationTemplate>
  );
};
