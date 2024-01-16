import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import logo from '../../assets/images/logo_white.svg';
import * as Yup from 'yup';
import ReCAPTCHA from 'react-google-recaptcha';
import { useLocalStorage } from '@uidotdev/usehooks';
import { appProperties } from '../../util/appProperties';
import { useEffect } from 'react';

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  confirmEmail: Yup.string()
    .email('Invalid email')
    .oneOf([Yup.ref('email')], 'Emails should match')
    .required('Required'),
  recaptcha: Yup.string().required('Please confirm you are not a robot')
});

const EmailVerificationForm = ({ setSubmittedEmail }) => {
  const [guestUserEmail, saveGuestUserEmail] = useLocalStorage('guestUserEmail', null);

  const initialValues = {
    email: '',
    confirmEmail: '',
    recaptcha: ''
  };
  useEffect(() => {
    if (guestUserEmail) saveGuestUserEmail(null);
  }, []);

  return (
    <div className="page-email-verification">
      <div className="authentication">
        <div className="authentication-wrapper">
          <div className="welcome">
            <div className="welcome-content">
              <img src={logo} alt="c20 logo" className="logo" />
              <h2>Email Verification</h2>
            </div>
          </div>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
              // Pass the values to the parent component's onSubmit handler
              saveGuestUserEmail(values.email);
              setSubmittedEmail(values.email);
              setSubmitting(false);
              // clear the previous carbon certificate form data if going from Email verification page
              //localStorage.removeItem('buyECertificateDetails');
            }}
          >
            {({ setFieldValue, values, errors }) => (
              <div className="signin">
                <div className="signin-content">
                  <div className="frm-var">
                    <Form>
                      <p className="keep-track-text">
                        Enter your email address to receive <br /> the verification code
                      </p>
                      <div className="frm-field">
                        <label className="lbl-var">Email</label>
                        <div className="field">
                          <Field
                            type="email"
                            name="email"
                            placeholder="Enter Email Address"
                            className={errors?.email ? 'input-error-message' : ''}
                          />
                          <ErrorMessage name="email" component="div" className="error-message" />
                        </div>
                      </div>

                      <div className="frm-field">
                        <label className="lbl-var">Confirm Email</label>
                        <div className="field">
                          <Field
                            type="email"
                            name="confirmEmail"
                            placeholder="Re-enter Email Address"
                            className={errors?.confirmEmail ? 'input-error-message' : ''}
                          />
                          <ErrorMessage name="confirmEmail" component="div" className="error-message" />
                        </div>
                      </div>

                      <div className="wr-main-wrapper">
                        <ReCAPTCHA
                          sitekey={appProperties.recapchaSiteKey}
                          name="recaptcha"
                          className="recaptcha-wrapper"
                          onChange={(value) => {
                            // Set the recaptcha value for validation
                            setFieldValue('recaptcha', value);
                          }}
                        />
                        <ErrorMessage name="recaptcha" component="div" className="error-message" />
                      </div>
                      <div className="button-wrapper">
                        <button className="btn-default" type="submit">
                          Send Code
                        </button>
                      </div>
                    </Form>
                  </div>
                </div>
              </div>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationForm;
