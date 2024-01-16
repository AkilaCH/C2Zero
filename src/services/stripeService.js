import { addHeaders } from '../util/apiHelper';
import { appProperties } from '../util/appProperties';

/**
 * Creates a payment intent.
 *
 * @param {string} emailForPaymentReceipt - The email address for the payment receipt.
 * @param {string} emailForEcertificate - The email address for the e-certificate.
 * @param {number} weight - The weight of the item.
 * @param {boolean} isNewsLetterSubscribed - Indicates whether the user is subscribed to the newsletter.
 * @return {Object} The payment intent data.
 */
export const createPaymentIntent = async (
  emailForPaymentReceipt,
  emailForEcertificate,
  weight,
  isNewsLetterSubscribed
) => {
  const apiEndpoint = appProperties.apiHost + '/Consumers/getPaymentIntent';
  const headers = await addHeaders(false, 'application/json'); // Set the Content-Type to JSON
  const body = JSON.stringify({
    emailForPaymentReceipt,
    emailForEcertificate,
    weight,
    isNewsLetterSubscribed
  });

  const options = {
    method: 'POST',
    headers: headers,
    body: body
  };

  try {
    const response = await fetch(apiEndpoint, options);
    if (!response.ok) {
      // Handle specific HTTP errors
      if (response.status === 401) {
        throw new Error('Unauthorized - Please log in.');
      } else if (response.status === 404) {
        throw new Error('Resource not found.');
      } else {
        throw new Error(`Request failed with status: ${response.status} - ${response.statusText}`);
      }
    } else {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    // Log and rethrow the error for the calling code to handle
    console.log('ERRCreatePaymentIntent: ', error);
    throw error;
  }
};
