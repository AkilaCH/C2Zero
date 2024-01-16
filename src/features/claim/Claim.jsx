import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import loader from '../../assets/8815-loading-animation.json';
import { SigninSignup } from '../../components/SigninSignup';
import { appProperties } from '../../util/appProperties';
import { getCreditInfo } from '../../services/claimService';
import { Player } from '@lottiefiles/react-lottie-player';

const Claim = ({ instance }) => {
  const [credtiDetails, setCreditDetails] = useState(null);
  const [credtiDetailsError, setCreditDetailsError] = useState(null);
  const { scanId, slotId } = useParams();
  const [isGetCreditInfoApiInProgress, setGetCreditInfoApiInProgress] = useState(true);

  useEffect(() => {
    const getCarbonCreditDetails = async () => {
      localStorage.setItem('claimUrl', (scanId ? scanId : '') + (slotId ? '/' + slotId : ''));
      try {
        setGetCreditInfoApiInProgress(true);
        const response = await getCreditInfo(scanId, slotId, appProperties.apiHost);
        setCreditDetails(response);
      } catch (error) {
        const errorDetails = error.status === 418 ? { ...error, tokenInfo: JSON.parse(error.detail) } : error;
        setCreditDetailsError(errorDetails);
      } finally {
        setGetCreditInfoApiInProgress(false);
      }
    };

    getCarbonCreditDetails();
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <div className="authentication">
        <div className="container">
          <div className="authentication-wrapper">
            <div className="welcome">
              <div className="welcome-content">
                <img src={logo} alt="c20 logo" className="logo" />
                {isGetCreditInfoApiInProgress ? (
                  <div className="locking-loader">
                    <Player autoplay loop src={loader} style={{ height: '200px', width: '200px' }}></Player>
                    <p>Loading carbon now</p>
                  </div>
                ) : credtiDetails ? (
                  <div>
                    {credtiDetails.vendorLogoUrl && (
                      <img src={credtiDetails.vendorLogoUrl} alt="vendor logo" className="vendor-logo" />
                    )}
                    {credtiDetails.quantityNormalizedValue && credtiDetails.productName ? (
                      <div>
                        <p className="locked-away-text">Almost there!</p>
                        <p className="amount-text">
                          Sign in or sign up and claim the{' '}
                          <b>{credtiDetails.quantityNormalizedValue ? credtiDetails.quantityNormalizedValue : 0}</b> of
                          CO2e you've locked away
                        </p>
                        <p className="amount-text">
                          by choosing{' '}
                          {credtiDetails.productName ? credtiDetails.productName : 'Error not fetching information'}
                        </p>
                      </div>
                    ) : (
                      <p className="locked-away-text text-left">Token information not found</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="locked-away-text text-left">
                      {credtiDetailsError && credtiDetailsError.title
                        ? credtiDetailsError.title
                        : 'Token information not found'}
                    </p>
                    {credtiDetailsError.tokenInfo && (
                      <div className="data">
                        <table>
                          <tr>
                            <td>Item</td>
                            <td>
                              {credtiDetailsError.tokenInfo.itemName ? credtiDetailsError.tokenInfo.itemName : ''}
                            </td>
                          </tr>
                          <tr>
                            <td>Vendor</td>
                            <td>{credtiDetailsError.tokenInfo.vendor ? credtiDetailsError.tokenInfo.vendor : ''}</td>
                          </tr>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <SigninSignup scanId={scanId} slotId={slotId} instance={instance} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Claim;
