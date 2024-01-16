import { Elements } from '@stripe/react-stripe-js';
import React from 'react';
import { CheckoutForm } from './CheckoutForm';
import { Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router';
import BackButton from '../../assets/images/arrow_back.svg';
import WhiteLogo from '../../assets/images/C2Zero-white-Logo.png';
import Phoneimage from '../../assets/images/Phone-img.png';
import StripeLogo from '../../assets/images/Stripe.svg';
import MobileScreenImg from '../../assets/images/mobile-display-img.png';
import { convertUnits } from '../../common/formatter';

const PaymentPage = (props) => {
  const { stripePromise } = props;
  const {
    state: { clientSecret, carbonQuantity, price, paymentIntentId }
  } = useLocation();
  const navigate = useNavigate();

  const handleBackButton = () => {
    localStorage.removeItem('buyECertificateDetails');
    navigate('/BuyCertificate');
  };

  return (
    <div className="container-fluid payment-page">
      <div className="row">
        <div className="col-md-6 col-sm-12 payment-background">
          <div className="cart-product-data">
            <div className="payment-header">
              <button className="back-btn" onClick={() => handleBackButton()}>
                <img src={BackButton} alt="backbutton" />
              </button>
              <img src={WhiteLogo} alt="white-logo" className="white-logo" />
            </div>

            <div className="payment-detail-wrapper mt-3">
              <div className="payment-details-text-wrapper ps-5 py-3">
                <h4 className="payment-details-title">Buy eCertificate</h4>
                <h1 className="payment-details-price">{`£${Number(price).toFixed(2)}`}</h1>
                <p className="payment-details-text">Including £3.81 in taxes</p>
              </div>

              <div className="payment-detail-box-wrapper mb-3">
                <div className="payment-detail-box">
                  <div className="image-wrapper">
                    <img src={Phoneimage} alt="mobile-img" className="mobile-img" />
                  </div>
                  <div className="text-wrapper pe-3 ps-3">
                    <h1 className="main-title">C2Zero eCertificate</h1>
                    <h3 className="sub-title">{convertUnits(carbonQuantity, 'kg')}</h3>
                  </div>
                </div>
                <div className="price-tag-wrapper">
                  <p className="price-tag">{`£${Number(price).toFixed(2)}`}</p>
                </div>
              </div>

              <div className="total-detail-wrapper">
                <div className="total-detail">
                  <div className="total-title">
                    <h1 className="main-title">total</h1>
                  </div>
                  <div className="price-tag-wrapper">
                    <p className="price-tag">{`£${Number(price).toFixed(2)}`}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mobile-payment-detail-wrapper">
              <div className="image-wrapper">
                <img src={MobileScreenImg} alt="mobile-screen-img" className="mobile-screen-image" />
              </div>
              <div className="text-wrapper text-center pe-3 ps-3 mt-5">
                <h1 className="main-title mt-1">C2Zero eCertificate</h1>
                <h3 className="sub-title mt-1">{convertUnits(carbonQuantity, 'kg')}</h3>
                <p className="price-tag mt-1">{`£${Number(price).toFixed(2)}`}</p>
                <p className="text-bottom mt-1">Including £3.81 in taxes</p>
              </div>
            </div>

            <div className="payment-footer">
              <p className="logo-text pe-3">Powered by</p>
              <img src={StripeLogo} alt="stripe-logo" className="stripe-logo" />
              <div className="vl mx-3"></div>
              <a href="#" className="payment-footer-links pe-3">
                Terms
              </a>
              <a href="#" className="payment-footer-links">
                Privacy
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-sm-12 stripe-form-wrapper">
          <div className="stripe-form-data">
            <h1 className="stripe-form-title">Enter Payment Details</h1>
            {clientSecret && stripePromise && (
              <Elements stripe={stripePromise} options={{ clientSecret: clientSecret }}>
                <CheckoutForm clientSecret={clientSecret} paymentIntentId={paymentIntentId} />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

/**
 * write a payment page routeGuard that will check if the user has a valid token
 * if the user has a valid token, then show the payment page
 * else redirect the user to the carbon certificate page
 */
