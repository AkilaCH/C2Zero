import { handleLogin, requestToken } from '../services/authService';
import { addSubscription } from '../services/mailChimpService';
import { appProperties } from './appProperties';
const unhandledError = {
  title: 'We apologise. Our system is down for maintenance. Please try again later.',
  status: 500,
  detail: 'We apologise. Our system is down for maintenance. Please try again later.'
};

export const addHeaders = async (authenticationRequired, instance = null) => {
  try {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    if (authenticationRequired) {
      const token = await requestToken(instance, instance.getAllAccounts());
      const bearer = `Bearer ${token}`;
      headers.append('Authorization', bearer);
    }

    return headers;
  } catch (err) {
    console.log('Error in Adding Headers: ', err);
    throw unhandledError;
  }
};

export const handleApiDefinedErrors = async (authenticationRequired, errorResponse, instance = null) => {
  if (authenticationRequired && errorResponse.status === 401) {
    localStorage.clear();
    await handleLogin(instance);
  } else if (errorResponse.status === 418 || errorResponse.status === 400) {
    return errorResponse;
  } else if (errorResponse.status === 500) {
    return unhandledError;
  }
};

export const handleUndefinedErrors = async (authenticationRequired, error, instance = null) => {
  if (authenticationRequired && error.status === 401) {
    localStorage.clear();
    handleLogin(instance);
  } else if (error.status === 500) {
    return error;
  } else {
    const data = await error.json();
    if (data.title === "Couldn't find the user.") {
      await addSubscription(instance, appProperties.apiHost);
    } else {
      return data;
    }
  }
};
