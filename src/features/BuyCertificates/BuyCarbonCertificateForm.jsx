import React, { useEffect, useMemo, useState } from 'react';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, Form, Col, InputGroup, Modal } from 'react-bootstrap';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useNavigate } from 'react-router-dom';
import { UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { handleLogin, handleSignup } from '../../services/authService';
import WhiteLogo from '../../assets/images/C2Zero-white-Logo.png';
import FaqAccordian from './FaqAccordian';
import Closebtn from '../../assets/images/Close.png';
import { createPaymentIntent } from '../../services/stripeService';
import { calculateCarbonAmountPriceGivenWeight } from '../../services/eCertificateService';
import { useMediaQuery } from 'react-responsive';
import ForwardArrow from '../../assets/images/arrow-forward.png';
import warningIcon from '../../assets/images/warning.png';
import { toast } from 'react-toastify';

const BuyCarbonCertificateForm = () => {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [overlayWidth, setOverlayWidth] = useState(0);
  const [paymentIntentAPIError, setPaymentIntentAPIError] = useState(false);

  const [buyECertificateDetails, saveBuyECertificateDetails] = useLocalStorage('buyECertificateDetails', null);
  const [guestUserEmail, saveGuestUserEmail] = useLocalStorage('guestUserEmail', null);
  const [isECertificateGifting, setIsEcertificateGifting] = useState(false);

  const applicationUserEmail = guestUserEmail ? guestUserEmail : instance.getActiveAccount()?.idTokenClaims.email;
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const [priceCalcAPIError, setPriceCalcAPIError] = useState(false);
  const validationSchema = useMemo(() => {
    if (!isECertificateGifting) {
      return Yup.object().shape({
        carbonQuantity: Yup.number().min(0.001, 'Minimum quantity should be 0.001 Kg').required('Quantity is required'),
        acceptTerms: Yup.boolean().oneOf([true], 'You must accept the terms of service and privacy policy')
      });
    } else {
      return Yup.object().shape({
        carbonQuantity: Yup.number().min(0.001, 'Minimum quantity should be 0.001 Kg').required('Quantity is required'),
        email: Yup.string()
          .email('Invalid email')
          .required('Email is required')
          .test(
            'isNotApplicationUserEmail',
            'The email cannot be the same as that of the currently logged-in user.',
            function (value) {
              if (isECertificateGifting && value === applicationUserEmail) {
                return false;
              }
              return true;
            }
          ),
        confirmEmail: Yup.string()
          .email('Invalid email')
          .oneOf([Yup.ref('email')], 'Emails should match')
          .required('Email is required'),
        acceptTerms: Yup.boolean().oneOf([true], 'You must accept the terms of service and privacy policy')
      });
    }
  }, [isECertificateGifting]);
  const handleJoinc2zero = () => {
    handleSignup(instance);
  };
  const handleSignIn = () => {
    handleLogin(instance);
  };
  const handleContineAsGuest = (formValues) => {
    const { email, confirmEmail, ...restFormValues } = formValues;
    saveBuyECertificateDetails(restFormValues);
    navigate('/OrderHistory');
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

  useEffect(() => {
    if (priceCalcAPIError)
      toast.error('Error in price calculation!', {
        onClose: () => setPriceCalcAPIError(null)
      });
    if (paymentIntentAPIError)
      toast.error('Error receiving payment intent!', {
        onClose: () => setPaymentIntentAPIError(null)
      });
  }, [priceCalcAPIError, paymentIntentAPIError]);

  const checkoutClickHandler = async (dirty, validateForm, setTouched) => {
    await setTouched({ carbonQuantity: true, email: true, confirmEmail: true }, true);
    const errors = await validateForm();
    if (Object.keys(errors).filter((key) => key !== 'acceptTerms').length === 0) {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="container-fluid">
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
              <h1 className="form-name mt-5 mb-5">
                Lock Away <span className="form-name-green">Carbon</span>{' '}
              </h1>
              <Formik
                initialValues={{
                  carbonQuantity: buyECertificateDetails ? buyECertificateDetails?.carbonQuantity : '',
                  currency: 'GBP',
                  price: buyECertificateDetails ? buyECertificateDetails?.price : '',
                  email: '',
                  confirmEmail: '',
                  newsletter: buyECertificateDetails ? buyECertificateDetails?.newsletter : false,
                  acceptTerms: buyECertificateDetails ? buyECertificateDetails?.acceptTerms : false
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  saveBuyECertificateDetails(values);
                  // If user is authenticated or guest user email is available
                  if (instance.getActiveAccount() || guestUserEmail) {
                    try {
                      let clientSecret;
                      let paymentIntentId;
                      const paymentIntentResponse = await createPaymentIntent(
                        applicationUserEmail,
                        isECertificateGifting ? values.email : applicationUserEmail,
                        values.carbonQuantity,
                        values.newsletter
                      );
                      if (paymentIntentResponse && paymentIntentResponse?.clientSecret) {
                        clientSecret = paymentIntentResponse.clientSecret;
                        paymentIntentId = paymentIntentResponse.paymentIntentId;
                      } else {
                        throw new Error('Payment intent response is undefined or missing result.');
                      }
                      navigate('/checkout', {
                        state: {
                          clientSecret: clientSecret,
                          carbonQuantity: values.carbonQuantity,
                          price: values.price,
                          paymentIntentId: paymentIntentId
                        }
                      });
                    } catch (error) {
                      console.error('Error fetching payment intent:', error);
                      setPaymentIntentAPIError(true);
                    }
                  } else {
                    setShowLoginModal(true);
                  }
                  setSubmitting(false);
                }}
              >
                {({ setFieldValue, values, isSubmitting, validateForm, dirty, setTouched, submitForm, errors }) => (
                  <FormikForm>
                    <Form.Group controlId="carbonQuantity" className="mb-3">
                      <Form.Label className="form-label">Carbon Quantity (Kg)</Form.Label>
                      <Field
                        type="text"
                        name="carbonQuantity"
                        placeholder="Enter quantity in Kg"
                        className={`form-control certificate-form-input ${
                          errors?.carbonQuantity ? 'invalid-input-values' : ''
                        }`}
                        // onKeyPress={(e) => {
                        //   if (e.key !== 'Backspace' && (e.key < '0' || e.key > '9')) {
                        //     e.preventDefault();
                        //   }
                        // }}
                        onChange={async (e, form) => {
                          if (e.target.value === '') {
                            setFieldValue('carbonQuantity', e.target.value);
                            setFieldValue('price', '');
                            return;
                          } else {
                            let enteredValue = e.target.value;
                            if (enteredValue === '.') {
                              enteredValue = '0.';
                            }
                            // Use a regular expression to restrict input to numeric values with up to 3 decimal places
                            const regex = /^\d*\.?\d{0,3}$/;
                            if (regex.test(enteredValue)) {
                              setFieldValue('carbonQuantity', enteredValue);
                            }
                            try {
                              const { price } = await calculateCarbonAmountPriceGivenWeight(enteredValue);
                              setFieldValue('price', price.toFixed(2));
                            } catch (error) {
                              setPriceCalcAPIError(true);
                              setFieldValue('carbonQuantity', '');
                            }
                          }
                        }}
                      />
                      <ErrorMessage name="carbonQuantity" component="div" className="text-danger" />
                    </Form.Group>

                    <Form.Group controlId="currency" className="mb-3">
                      <Form.Label className="form-label">Currency</Form.Label>
                      <InputGroup>
                        <Field
                          type="text"
                          name="currency"
                          className="form-control certificate-form-input disabled-input"
                          disabled
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group controlId="price" className="mb-3">
                      <Form.Label className="form-label">Price</Form.Label>
                      <Field
                        type="number"
                        name="price"
                        className="form-control certificate-form-input disabled-input"
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group controlId="newsletter" as={Col}>
                      <Form.Check
                        type="checkbox"
                        label="Email me with Carbon News"
                        name="newsletter"
                        onChange={(event) => {
                          setFieldValue('newsletter', event.target.checked);
                        }}
                        checked={values.newsletter}
                      />
                    </Form.Group>
                    <div className="gift-area-wrapper my-3">
                      <p className="form-label">Are you gifting this eCertificate?</p>
                      <div className="gift-area-button-wrapper mt-1">
                        <Button
                          className={`btn gift-area-button me-3 ${isECertificateGifting ? 'active' : ''}`}
                          variant="light"
                          onClick={() => setIsEcertificateGifting(true)}
                        >
                          Yes
                        </Button>
                        <Button
                          className={`btn gift-area-button ${!isECertificateGifting ? 'active' : ''}`}
                          variant="light"
                          onClick={() => setIsEcertificateGifting(false)}
                        >
                          No
                        </Button>
                      </div>
                    </div>
                    {isECertificateGifting && (
                      <>
                        <Form.Group controlId="email" className="mb-3">
                          <Form.Label className="form-label">Reciever Email</Form.Label>
                          <Field
                            type="email"
                            name="email"
                            className={`form-control certificate-form-input ${
                              errors?.email ? 'invalid-input-values' : ''
                            }`}
                          />
                          <ErrorMessage name="email" component="div" className="text-danger" />
                        </Form.Group>

                        <Form.Group controlId="confirmEmail" className="mb-3">
                          <Form.Label className="form-label">Re-enter Reciever Email</Form.Label>
                          <Field
                            type="email"
                            name="confirmEmail"
                            className={`form-control certificate-form-input ${
                              errors?.confirmEmail ? 'invalid-input-values' : ''
                            }`}
                          />
                          <ErrorMessage name="confirmEmail" component="div" className="text-danger" />
                        </Form.Group>
                      </>
                    )}
                    <div className="center-button-container my-5">
                      <Button
                        variant="primary"
                        className="submit-button"
                        onClick={() => checkoutClickHandler(dirty, validateForm, setTouched)}
                      >
                        Checkout
                      </Button>
                    </div>
                    <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} className="my-5">
                      <Modal.Body className="sign-in-modal">
                        <div className="sign-in-modal-wrapper my-5">
                          <div className="modal-text-wrapper">
                            <h1 className="modal-main-title pe-3">Proceeding to Checkout</h1>
                            <img src={ForwardArrow} alt="arrow-forward" className="arrow-forward" />
                          </div>
                          <div className="modal-text-box-wrapper my-3">
                            <p className="modal-text-box-para">
                              <span className="green-text">Disclaimer: </span>
                              All sales final. By completing this purchase, you agree to our terms and conditions. For
                              assistance, contact customer support. Thank you for choosing C2Zero.
                            </p>
                            <Form.Group controlId="acceptTerms" as={Col} className="mb-1">
                              <Form.Check name="acceptTerms">
                                <Form.Check.Input
                                  type="checkbox"
                                  onChange={(event) => {
                                    setFieldValue('acceptTerms', event.target.checked);
                                  }}
                                  checked={values.acceptTerms}
                                />
                                <Form.Check.Label className="terms-text">
                                  Accept the{' '}
                                  <a href="https://www.c2zero.net/terms" target="_blank" className="terms-link">
                                    <span className="link-span">Terms of service</span>
                                  </a>{' '}
                                  and{' '}
                                  <a href="https://www.c2zero.net/privacy" target="_blank" className="terms-link">
                                    <span className="link-span">privacy policy</span>
                                  </a>
                                </Form.Check.Label>
                              </Form.Check>
                              <ErrorMessage name="acceptTerms" component="div" className="text-danger" />
                            </Form.Group>
                          </div>
                          {instance.getActiveAccount() || guestUserEmail ? (
                            <Button
                              variant="primary"
                              className="submit-button mt-3"
                              disabled={isSubmitting || values?.acceptTerms === false}
                              onClick={() =>
                                submitForm().then(() => {
                                  console.log('done');
                                })
                              }
                            >
                              Continue
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="primary"
                                onClick={handleSignIn}
                                className="modal-btn btn-black mt-3 mb-2"
                                disabled={values?.acceptTerms === false}
                              >
                                Sign in
                              </Button>

                              <label className="sign-up-text">
                                New User?
                                <Button
                                  variant="link"
                                  className="sign-up"
                                  onClick={() => handleJoinc2zero()}
                                  disabled={values?.acceptTerms === false}
                                >
                                  Create Account
                                </Button>
                              </label>
                              <div className="wr-vertical-lines">
                                <hr className="vertical-lines" />
                                <label className="px-3">or</label>
                                <hr className="vertical-lines" />
                              </div>
                              <Button
                                variant="link"
                                onClick={() => handleContineAsGuest(values)}
                                className="guest-btn"
                                disabled={values?.acceptTerms === false}
                              >
                                Continue as a guest
                              </Button>
                              <div className="modal-footer">
                                <p className="footer-text">
                                  <img src={warningIcon} alt="warning-icon" className="pe-2" />
                                  You will be able to sign in or create account after you check out
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </Modal.Body>
                    </Modal>
                  </FormikForm>
                )}
              </Formik>
              <p className="text-center copyright-text">Copyright © {new Date().getFullYear()} C2Zero.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyCarbonCertificateForm;
