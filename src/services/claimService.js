import { addHeaders, handleApiDefinedErrors, handleUndefinedErrors } from '../util/apiHelper';

export const getCreditInfo = async (scanId, slotId, apiHost) => {
  try {
    const apiEndpoint = apiHost + '/ProductTokens/PMSUnitDetail?scanId=' + scanId + '&slotId=' + slotId;
    const headers = await addHeaders(false);

    const options = {
      method: 'GET',
      headers: headers
    };
    const response = await fetch(apiEndpoint, options);
    if (!response.ok) {
      throw await handleApiDefinedErrors(false, response);
    } else {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.log('ERRGetCreditInfo: ', error);
    throw await handleUndefinedErrors(false, error);
  }
};

export const getAllTransactionsService = async (instance, apiHost, pageNumber, pageSize) => {
  try {
    const apiEndpoint =
      apiHost +
      '/producttokens' +
      (pageNumber ? '?PageNumber=' + pageNumber : '') +
      (pageSize ? '&pageSize=' + pageSize : '');
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
    console.log('ERRGetAllTransactionsService: ', error);
    throw await handleUndefinedErrors(true, error, instance);
  }
};

export const claimCarbonService = async (instance, scanId, slotId, apiHost) => {
  try {
    const apiEndpoint = apiHost + '/producttokens';
    const data = {
      scanId: scanId,
      slotId: slotId
    };
    const headers = await addHeaders(true, instance);

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    };

    const response = await fetch(apiEndpoint, options);
    if (!response.ok) {
      throw await handleApiDefinedErrors(true, response, instance);
    } else {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.log('ERRClaimCarbonService: ', error);
    throw await handleUndefinedErrors(true, error, instance);
  }
};
