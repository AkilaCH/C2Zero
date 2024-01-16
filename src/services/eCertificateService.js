import { addHeaders } from '../util/apiHelper';
import { appProperties } from '../util/appProperties';
import { ApiError } from '../util/errorClassess';

/**
 * Retrieves the order history for an e-certificate based on the provided parameters.
 *
 * @param {string} email - The email address associated with the e-certificate order history.
 * @param {number} pageNumber - The page number of the order history to retrieve.
 * @param {number} pageSize - The number of items per page in the order history.
 * @param {string} searchKeyword - The keyword to search for in the order history.
 * @param {Array<{key: string, value: string}>} filters - Array of key-value pair objects used for filtering the order history.
 * @return {Promise<object>} The order history data.
 */
export const getEcertificateOrderHistory = async (email, pageNumber, pageSize, searchKeyword, filters) => {
  const requestBody = {
    pageNumber,
    pageSize,
    searchKeyword,
    filters
  };

  const apiEndpoint = appProperties.apiHost + '/Consumers/getPurchaseHistoryList' + `?email=${email}`;
  const headers = await addHeaders(false, null);
  const options = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(requestBody)
  };

  try {
    const response = await fetch(apiEndpoint, options);
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new ApiError(`API Error: get Ecertificate Order History`, errorResponse?.status);
    } else {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.log('ERR GetEcertificateOrderHistory: ', error);
    throw error;
  }
};
/**
 * Resends an existing e-certificate.
 *
 * @param {string} orderNumber - The orderNumber of the e-certificate to resend.
 * @return {Promise<any>} - A promise that resolves to the data returned from the API.
 */
export const resendExistingECertificate = async (orderNumber) => {
  const queryParams = `orderNumber=${orderNumber}`;
  const apiEndpoint = appProperties.apiHost + '/Consumers/resendEcertificate' + '?' + queryParams;
  const headers = await addHeaders(false, null);
  const options = {
    method: 'GET',
    headers: headers
  };

  try {
    const response = await fetch(apiEndpoint, options);
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new ApiError(`API Error: resending e-certificate`, errorResponse?.status);
    } else {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.log('ERR ResendExistingECertificate: ', error);
    throw error;
  }
};
/**
 * Retrieves the order summary for an e-certificate checkout.
 *
 * @param {string} checkoutId - The ID of the checkout.
 * @return {Promise} A Promise that resolves to the order summary data.
 */
export const getEcertificateOrderSummary = async (checkoutId) => {
  const queryParams = `checkoutId=${checkoutId}`;
  const apiEndpoint = appProperties.apiHost + '/Consumers/getPurchaseSummary' + '?' + queryParams;
  const headers = await addHeaders(false, null);
  const options = {
    method: 'GET',
    headers: headers
  };

  try {
    const response = await fetch(apiEndpoint, options);
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new ApiError(`API Error: get EcertificateOrder Summary`, errorResponse?.status);
    } else {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.log('ERR GetEcertificateOrderSummary: ', error);
    throw error;
  }
};
/**
 * Calculates the price of carbon amount given the weight.
 *
 * @param {Number} weight - The weight of the carbon amount in kg.
 * @return {Promise} Returns a promise that resolves to the calculated price.
 */
export const calculateCarbonAmountPriceGivenWeight = async (weight) => {
  const queryParams = `weight=${weight * 1000}`;
  const apiEndpoint = appProperties.apiHost + '/Consumers/calculateAmount' + '?' + queryParams;
  const headers = await addHeaders(false, null);
  const options = {
    method: 'GET',
    headers: headers
  };

  try {
    const response = await fetch(apiEndpoint, options);
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new ApiError(`API Error: calculate Carbon Amount Price`, errorResponse?.status);
    } else {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.log('ERR CalculateCarbonAmountPriceGivenWeight: ', error);
    throw error;
  }
};
