import { checkUserExist } from '../services/authService';
import { appProperties } from '../util/appProperties';

export const checkCurrentUserAccountStatus = async (instance) => {
  try {
    const result = await checkUserExist(instance, appProperties.apiHost);
    if (result) {
      return result;
    }
  } catch (error) {
    throw error;
  }
};
