import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';

import { useParams } from 'react-router-dom';
import { SigninSignup } from '../../components/SigninSignup';
import { appProperties } from '../../util/appProperties';
import { getCreditInfo, claimCarbonService } from '../../services/claimService';

import logo from '../../assets/images/logo-dark-2-optimized.png';
import loader from '../../assets/8815-loading-animation.json';
import '../../styles/style.scss';
import { useNavigate } from 'react-router';
import { Spinner } from 'react-bootstrap';
import { Player } from '@lottiefiles/react-lottie-player';
import { toast } from 'react-toastify';

const AddToTally = ({ instance }) => {
  const navigate = useNavigate();
  const [creditInfo, setCreditInfo] = useState(null);
  const { accounts } = useMsal();
  const { scanId, slotId } = useParams();
  const [isGetCreditInfoApiInProgress, setGetCreditInfoApiInProgress] = useState(true);
  const [isClaimCarbonApiInProgress, setClaimCarbonApiInProgress] = useState(false);
  const [credtiDetailsError, setCreditDetailsError] = useState(null);
  const [err, setError] = useState(null);

  if (accounts.length > 0) {
    instance.setActiveAccount(accounts[0]);
  }

  const claimCarbon = async () => {
    try {
      setClaimCarbonApiInProgress(true);
      const response = await claimCarbonService(instance, scanId, slotId, appProperties.apiHost);
      if (response) {
        localStorage.removeItem(scanId);
        navigate('/dashboard');
      } else {
        setError(response);
      }
    } catch (error) {
      setError(error);
    } finally {
      setClaimCarbonApiInProgress(false);
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    const getCreditInformation = async () => {
      try {
        setGetCreditInfoApiInProgress(true);
        const response = await getCreditInfo(scanId, slotId, appProperties.apiHost);
        setCreditInfo(response);
      } catch (error) {
        const errorDetails = error.status === 418 ? { ...error, tokenInfo: JSON.parse(error.detail) } : error;
        setCreditDetailsError(errorDetails);
      } finally {
        setGetCreditInfoApiInProgress(false);
      }
    };

    getCreditInformation();
    return () => {
      setClaimCarbonApiInProgress(false);
    };
  }, [instance, scanId, slotId, accounts]);

  useEffect(() => {
    if (err && err?.title)
      toast.error(err.title, {
        onClose: () => setError(null)
      });
  }, [err]);

  return (
    <div>
      <div className="authentication claim">
        <div className="container">
          <div className="authentication-wrapper">
            <div className="welcome">
              <div className="welcome-content">
                <img src={logo} alt="c20 logo" className="logo" />
                {isGetCreditInfoApiInProgress ? (
                  <div className="locking-loader dark">
                    <Player autoplay loop src={loader} style={{ height: '200px', width: '200px' }}></Player>
                    <p>Loading carbon now</p>
                  </div>
                ) : creditInfo ? (
                  <div>
                    {creditInfo.vendorLogoUrl && (
                      <img src={creditInfo.vendorLogoUrl} alt="vendor logo" className="vendor-logo" />
                    )}
                    {creditInfo.quantityNormalizedValue && creditInfo.productName ? (
                      <div>
                        <p className="locked-away-text">Boom!</p>
                        <p className="amount-text">
                          <b>{creditInfo.quantityNormalizedValue ? creditInfo.quantityNormalizedValue : 0}</b> of CO2e
                          locked away
                        </p>
                        <p className="locked-away-text">
                          by choosing{' '}
                          {creditInfo.productName ? creditInfo.productName : 'Error not fetching information'}
                        </p>
                        <p className="saying-text">Now big polluters can never get their hands on it.</p>
                        <div className="claim-carbon">
                          <h3>Add this to your personal carbon tally</h3>
                          <AuthenticatedTemplate>
                            <button className="btn-default" onClick={claimCarbon} disabled={isClaimCarbonApiInProgress}>
                              {isClaimCarbonApiInProgress && (
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  variant="light"
                                  style={{ marginRight: '10px' }}
                                />
                              )}
                              Claim this Carbon
                            </button>
                          </AuthenticatedTemplate>
                        </div>
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
                    <button className="btn-default" onClick={navigateToDashboard}>
                      Go to Dashboard
                    </button>
                  </div>
                )}
              </div>
              <UnauthenticatedTemplate>
                <SigninSignup instance={instance} />
              </UnauthenticatedTemplate>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToTally;
