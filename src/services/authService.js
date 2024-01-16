import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { appProperties } from '../util/appProperties';
import { loginRequest, b2cPolicies } from '../util/azureConf';
import { addHeaders, handleApiDefinedErrors, handleUndefinedErrors } from '../util/apiHelper';

export const handleSignupFromClaim = (instance) => {
  sessionStorage.clear();
  const request = {
    ...loginRequest,
    extraQueryParameters: { claimUrl: localStorage.getItem('claimUrl') },
    authority: b2cPolicies.authorities.signUp.authority,
    redirectUri: appProperties.redirectUri + '/claimAuth'
  };

  instance.loginRedirect(request).catch((e) => {
    console.error(e);
  });
};

export const handleSignup = (instance) => {
  sessionStorage.clear();
  const request = {
    ...loginRequest,
    authority: b2cPolicies.authorities.signUp.authority,
    redirectUri: appProperties.redirectUri + '/auth'
  };
  instance.loginRedirect(request).catch((e) => {
    console.error(e);
  });
};

export const handleLoginFromClaim = (instance) => {
  sessionStorage.clear();
  const request = {
    ...loginRequest,
    extraQueryParameters: { claimUrl: localStorage.getItem('claimUrl') },
    redirectUri: appProperties.redirectUri + '/claimAuth'
  };
  instance.loginRedirect(request).catch((e) => {
    console.error(e);
  });
};

export const handleLogin = async (instance) => {
  sessionStorage.clear();
  const request = {
    ...loginRequest,
    redirectUri: appProperties.redirectUri + '/auth'
  };
  instance.loginRedirect(request).catch((e) => {
    console.error(e);
  });
};

export const handleLogout = (instance) => {
  const accounts = instance.getAllAccounts();
  accounts.forEach((account) => {
    instance.logoutRedirect({
      account: account,
      postLogoutRedirectUri: window.location.origin + '/'
    });
  });
};

export const isUpdated = (curUser, prevUser) => {
  let account1 = curUser;
  let account2 = prevUser;

  let updated = false;
  if (account1 !== null && account2 !== null) {
    if (account1.extension_BirthYear !== account2.extension_BirthYear) {
      updated = true;
    }
    if (account1.country !== account2.country) {
      updated = true;
    }
    if (account1.extension_Gender !== account2.extension_Gender) {
      updated = true;
    }
    if (account1.postalCode !== account2.postalCode) {
      updated = true;
    }
  }
  return updated;
};

export const getEditedProfile = (instance) => {
  try {
    const accounts = instance.getAllAccounts();
    const editedProfile = accounts.filter((account) =>
      account.idTokenClaims.acr.toLowerCase().match(b2cPolicies.names.profileEdit.toLocaleLowerCase())
    );
    if (editedProfile.length > 0) {
      return editedProfile[0].idTokenClaims;
    } else {
      return accounts[0].idTokenClaims;
    }
  } catch (err) {
    console.log('ERRGetEditedProfile: ', err);
  }
};

export const handleProfileEdit = async (instance) => {
  sessionStorage.clear();
  await selectAccount(instance);
  const accounts = instance.getAllAccounts();
  const account = instance.getActiveAccount() ? instance.getActiveAccount() : accounts[0];
  console.log('Account: ', account);

  const accessTokenRequest = {
    ...loginRequest,
    authority: b2cPolicies.authorities.profileEdit.authority,
    loginHint: account.idTokenClaims.otherMails[0],
    domainHint: account.idTokenClaims.idp,
    redirectUri: appProperties.redirectUri + '/myprofile'
  };
  instance.loginRedirect(accessTokenRequest).catch((e) => {
    console.log(e);
  });
};

export const handleChangePassword = async (instance) => {
  sessionStorage.clear();
  await selectAccount(instance);
  const accounts = instance.getAllAccounts();
  const account = instance.getActiveAccount() ? instance.getActiveAccount() : accounts[0];

  const accessTokenRequest = {
    ...loginRequest,
    authority: b2cPolicies.authorities.changePassword.authority,
    loginHint: account.idTokenClaims.otherMails[0],
    domainHint: account.idTokenClaims.idp,
    redirectUri: appProperties.redirectUri + '/myprofile'
  };
  instance.loginRedirect(accessTokenRequest).catch((e) => {
    console.log(e);
  });
};

export const checkUserExist = async (instance, apiHost) => {
  try {
    const apiEndpoint = apiHost + '/Consumers/IsExist';
    const headers = await addHeaders(true, instance);

    const options = {
      method: 'GET',
      headers: headers
    };

    const response = await fetch(apiEndpoint, options);
    if (!response.ok) {
      throw await handleApiDefinedErrors(true, response, instance);
    } else {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.log('ERRCheckUserExist: ', error);
    throw await handleUndefinedErrors(true, error, instance);
  }
};

export const selectAccount = async (instance) => {
  try {
    const currentAccounts = instance.getAllAccounts();
    if (currentAccounts.length < 1) {
      return;
    } else if (currentAccounts.length > 1) {
      const accounts = currentAccounts.filter(
        (account) =>
          (account.homeAccountId.toLocaleUpperCase().includes(b2cPolicies.names.signinSignup.toLocaleUpperCase()) ||
            account.homeAccountId.toLocaleUpperCase().includes(b2cPolicies.names.signUp.toLocaleUpperCase())) &&
          account.idTokenClaims.iss.toLocaleUpperCase().includes(appProperties.authorityDomain.toLocaleUpperCase()) &&
          account.idTokenClaims.aud === instance.getConfiguration().auth.clientId
      );
      if (accounts.length > 1) {
        // localAccountId identifies the entity for which the token asserts information.
        if (accounts.every((account) => account.localAccountId === accounts[0].localAccountId)) {
          // All accounts belong to the same user
          instance.setActiveAccount(accounts[0]);
        } else {
          // Multiple users detected. Logout all to be safe.
          handleLogout();
        }
      } else if (accounts.length === 1) {
        instance.setActiveAccount(accounts[0]);
      }
    } else if (currentAccounts.length === 1) {
      instance.setActiveAccount(currentAccounts[0]);
    }
  } catch (err) {
    console.log('Error occured while selecting the account', err);
  }
};

export const requestToken = async (instance, accounts) => {
  try {
    await selectAccount(instance);
    const account = instance.getActiveAccount() ? instance.getActiveAccount() : accounts[0];
    const accessTokenRequest = {
      ...loginRequest,
      loginHint: account.idTokenClaims.otherMails[0],
      domainHint: account.idTokenClaims.idp,
      account: account
    };

    const accessTokenResponse = await instance.acquireTokenSilent(accessTokenRequest);
    if (accessTokenResponse) {
      return accessTokenResponse.accessToken;
    }
  } catch (error) {
    console.log('Error occured while acquiring token silent', error);
    if (error instanceof InteractionRequiredAuthError) {
      try {
        const accessTokenResponse = instance.acquireTokenRedirect(loginRequest);
        return accessTokenResponse.accessToken;
      } catch (error) {
        console.log('Error occured while acquiring token redirect', error);
        handleLogin(instance);
      }
    } else {
      console.log('Error occured while acquiring token silent', error);
      handleLogin(instance);
    }
  }
};

export const checkAPiHealth = async () => {
  try {
    const apiEndpoint = appProperties.apiHost + '/ProductTokens/SleepPing';
    const response = await fetch(apiEndpoint, null);
    if (response.status === 200) {
      console.log(response);
    } else {
      throw response;
    }
  } catch (error) {
    throw error;
  }
};

export const softDeleteUser = async (instance, apiHost) => {
  try {
    const apiEndpoint = apiHost + '/Consumers/RequestUserDelete';
    const headers = await addHeaders(true, instance);

    const options = {
      method: 'DELETE',
      headers: headers
    };

    const response = await fetch(apiEndpoint, options);
    if (!response.ok) {
      throw await handleApiDefinedErrors(true, response, instance);
    } else {
      if (response.status === 200) {
        return true;
      }
    }
  } catch (error) {
    console.log('ERRDeleteUser: ', error);
    throw await handleUndefinedErrors(true, error, instance);
  }
};

export const revertUserSoftDeleteAction = async (instance, apiHost) => {
  try {
    const apiEndpoint = apiHost + '/Consumers/RemoveUserDeleteRequest';
    const headers = await addHeaders(true, instance);

    const options = {
      method: 'DELETE',
      headers: headers
    };

    const response = await fetch(apiEndpoint, options);
    if (!response.ok) {
      throw await handleApiDefinedErrors(true, response, instance);
    } else {
      if (response.status === 200) {
        return true;
      }
    }
  } catch (error) {
    console.log('ERRDeleteUser: ', error);
    throw await handleUndefinedErrors(true, error, instance);
  }
};
