import { addHeaders, handleApiDefinedErrors, handleUndefinedErrors } from '../util/apiHelper';
import { appProperties } from '../util/appProperties';
import { checkUserExist } from './authService';

export const addSubscription = async (instance, apiHost) => {
  try {
    const apiEndpoint = apiHost + '/Consumers';
    const headers = await addHeaders(true, instance);

    const result = await checkUserExist(instance, appProperties.apiHost);
    const options = {
      method: 'POST',
      headers: headers
    };
    if (!result?.isUserExist) {
      const response = await fetch(apiEndpoint, options);
      if (!response.ok) {
        throw await handleApiDefinedErrors(true, response, instance);
      } else {
        const data = await response.json();
        return data;
      }
    } else {
      return true;
    }
  } catch (error) {
    console.log('ERRAddSubscription: ', error);
    throw await handleUndefinedErrors(true, error, instance);
  }
};

export const getSubscription = async (instance, apiHost) => {
  const apiEndpoint = apiHost + '/Consumers/NewsLetterSubscription';
  const headers = await addHeaders(true, instance);

  const options = {
    method: 'GET',
    headers: headers
  };

  try {
    const response = await fetch(apiEndpoint, options);
    if (!response.ok) {
      throw await handleApiDefinedErrors(true, response, instance);
    } else {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.log('ERRGetSubscription: ', error);
    throw await handleUndefinedErrors(true, error, instance);
  }
};

export const updateSubscription = async (instance, apiHost) => {
  const apiEndpoint = apiHost + '/Consumers/NewsLetterSubscription';
  const headers = await addHeaders(true, instance);

  const options = {
    method: 'PUT',
    headers: headers
  };

  try {
    const response = await fetch(apiEndpoint, options);
    if (!response.ok) {
      throw await handleApiDefinedErrors(true, response, instance);
    } else {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.log('ERRUpdateSubscription: ', error);
    throw await handleUndefinedErrors(true, error, instance);
  }
};
