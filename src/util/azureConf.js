import { LogLevel } from '@azure/msal-browser';
import { appProperties } from './appProperties';

export const b2cPolicies = {
  names: {
    signinSignup: appProperties.signInSignupPolicy,
    signUp: appProperties.signupPolicy,
    profileEdit: appProperties.profileEditPolicy,
    changePassword: appProperties.changePasswordPolicy
  },
  authorities: {
    signIn: {
      authority: appProperties.authorityUrl + appProperties.signInSignupPolicy
    },
    signUp: {
      authority: appProperties.authorityUrl + appProperties.signupPolicy
    },
    profileEdit: {
      authority: appProperties.authorityUrl + appProperties.profileEditPolicy
    },
    changePassword: {
      authority: appProperties.authorityUrl + appProperties.changePasswordPolicy
    }
  }
};

var isIE = function isIE() {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf('MSIE ') > -1;
  var msie11 = ua.indexOf('Trident/') > -1;
  return msie || msie11;
};

export const msalConfig = {
  auth: {
    clientId: appProperties.clientId,
    authority: b2cPolicies.authorities.signIn.authority,
    knownAuthorities: [appProperties.authorityDomain],
    redirectUri: appProperties.redirectUri,
    postLogoutRedirectUri: appProperties.redirectUri,
    navigateToLoginRequestUrl: false
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: isIE()
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
        }
      }
    }
  }
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: [appProperties.readScope, appProperties.writeScope, 'openid', 'profile', 'email', 'offline_access']
};
