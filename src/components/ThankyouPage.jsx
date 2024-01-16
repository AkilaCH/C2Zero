import React, { useState, useEffect } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import WhiteLogo from '../assets/images/C2Zero-white-Logo.png';
import Closebtn from '../assets/images/Close.png';
import FaqAccordian from '../features/BuyCertificates/FaqAccordian';
import { UnauthenticatedTemplate } from '@azure/msal-react';
import { useMediaQuery } from 'react-responsive';
import { useLocation, useNavigate } from 'react-router';
import { getEcertificateOrderSummary } from '../services/eCertificateService';
import PageLoader from './PageLoader';
import { toast } from 'react-toastify';
import { convertUnits } from '../common/formatter';

export const ThankyouPage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [overlayWidth, setOverlayWidth] = useState(0);
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const [getPurchaseSummaryInProgress, setGetPurchaseSummaryInProgress] = useState(true);
  const [purchaseSummary, setPurchaseSummary] = useState(null);
  const [getOrderSummaryAPIError, setGetOrderSummaryAPIError] = useState(false);
  const navigate = useNavigate();
  const {
    state: { clientSecret, paymentIntentId }
  } = useLocation();

  useEffect(() => {
    const getPurchaseSummary = async () => {
      try {
        const response = await getEcertificateOrderSummary(paymentIntentId);
        if (response) {
          setPurchaseSummary(response);
        }
      } catch (error) {
        console.log('ERRGetEcertificateOrderHistory: ', error);
        // show error message notification
        setGetOrderSummaryAPIError(true);
      } finally {
        setGetPurchaseSummaryInProgress(false);
      }
    };
    if (clientSecret) getPurchaseSummary();
    else navigate('/BuyCertificate');
  }, []);

  useEffect(() => {
    if (getOrderSummaryAPIError)
      toast.error('Error in receiving order summary!', {
        onClose: () => setGetOrderSummaryAPIError(false)
      });
  }, [getOrderSummaryAPIError]);

  const handleJoinc2zero = () => {
    //handleSignup(instance);
  };
  const handleSignIn = () => {
    //handleLogin(instance);
  };
  const handleContineAsGuest = () => {
    //navigate('/OrderHistory');
  };

  const openOverlay = () => {
    setOverlayWidth(100);
  };
  const openOverlayMobile = () => {
    setOverlayWidth(100);
  };
  const closeOverlay = () => {
    setOverlayWidth(0);
  };
  const lockAwayMoreCarbonHandler = () => {
    navigate('/BuyCertificate');
  };

  useEffect(() => {
    localStorage.removeItem('buyECertificateDetails');
    localStorage.removeItem('guestUserEmail');
  }, []);

  if (getPurchaseSummaryInProgress) {
    return <PageLoader />;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-6 col-md-12 col-sm-12 background-img">
          <Button
            className="faq-btn"
            variant="primary"
            onClick={() => (isTabletOrMobile ? openOverlayMobile() : openOverlay())}
          >
            FAQ
          </Button>
          <div className="logo-wrapper">
            <img src={WhiteLogo} alt="white-logo" className="logo-top" />
          </div>
          <h1 className="form-name-green mt-4 mb-5 text-center">
            Lock Away <span className="form-name-green-mobile">Carbon</span>{' '}
          </h1>

          <div id="myNav" className="col-lg-6 col-md-12 col-sm-12 overlay" style={{ width: `${overlayWidth}%` }}>
            <div className="btn close-btn" onClick={closeOverlay}>
              <img src={Closebtn} alt="close-btn" />
            </div>
            <div className="logo-wrapper">
              <img src={WhiteLogo} alt="white-logo" className="logo-top" />
            </div>
            <div className="faq-modal-wrapper">
              <Modal.Header>
                <Modal.Title className="faq-modal-title mt-5">Frequently Asked Questions</Modal.Title>
              </Modal.Header>
              <Modal.Body className="faq-modal-body mt-1 mb-5 px-5">
                <div className="wr-faq-modal-body">
                  <FaqAccordian />
                </div>
              </Modal.Body>
            </div>
          </div>
        </div>

        <div className="col-lg-6 col-md-12 col-sm-12 form-wrapper">
          <div className="buy-certificate-form-wrapper">
            <div className="buy-certificate-form">
              <div className="wr-form-signin-btn">
                <UnauthenticatedTemplate>
                  <Button variant="dark" className="form-signin-btn mt-5" onClick={() => handleSignIn()}>
                    Sign In
                  </Button>
                </UnauthenticatedTemplate>
              </div>
              {!getOrderSummaryAPIError && (
                <div className="purchase-text-wrapper mt-5">
                  <h1 className="purchase-text-title">
                    Thank you for your <br /> eCertificate purchase!
                  </h1>
                  <p className="purchase-text">Your Impact: A World Saved, A Future Secured!</p>
                  <p className="purchase-text-small mt-5">
                    We are currently preparing your e-certificate and will notify you through email as soon as it is
                    ready.
                  </p>
                  <div className="my-3">
                    <hr className="dash-lines" />
                  </div>

                  <div className="wr-purchase-summery">
                    <div className="wr-purchase-summery-title">
                      <h1 className="purchase-summery-title py-3">Purchase Summary</h1>
                    </div>
                    <div className="d-flex wr-main-details-list">
                      <table class="table">
                        <tbody>
                          <tr>
                            <th scope="row" className="black-text">
                              Date
                            </th>
                            <td className="grey-text">
                              {new Date(purchaseSummary.purchaseDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </td>
                          </tr>
                          <tr>
                            <th scope="row" className="black-text">
                              Carbon Quantity
                            </th>
                            <td className="grey-text">
                              {convertUnits(purchaseSummary.gramsQuantity, purchaseSummary.unitOfMeasure)}
                            </td>
                          </tr>
                          <tr>
                            <th scope="row" className="black-text">
                              Reference Instrument
                            </th>
                            <td className="grey-text">{purchaseSummary.referenceInstrument}</td>
                          </tr>
                          <tr>
                            <th scope="row" className="black-text">
                              Total Price
                            </th>
                            <td className="grey-text">{`${purchaseSummary.price}`}</td>
                          </tr>
                          <tr>
                            <th scope="row" className="black-text">
                              Order #
                            </th>
                            <td className="grey-text">{purchaseSummary.orderNumber}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="wr-purchase-summery-button my-3">
                    <button className="btn btn-dark purchase-summery-button" onClick={lockAwayMoreCarbonHandler}>
                      Lock away more carbon
                    </button>
                  </div>

                  <div className="my-3">
                    <hr className="dash-lines" />
                  </div>

                  <div className="d-flex flex-row wr-purchase-summery-link my-4">
                    <p className="purchase-summery-link-text">Interested in learning more?</p>
                    <a href="#" className="purchase-summery-link">
                      Visit C2Zero.net
                    </a>
                  </div>

                  <div className="footer-wrapper mb-5">
                    <p className="text-left copyright-text">Copyright © {new Date().getFullYear()} C2Zero.</p>
                    <Button variant="link" className="privacy-policy">
                      Privacy Policy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
