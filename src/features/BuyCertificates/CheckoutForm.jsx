import { useMsal } from '@azure/msal-react';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import StripeCardsImg from '../../assets/images/stripe-card.png';
import Spinner from 'react-bootstrap/Spinner';
import WarningIcon from '../../assets/images/warning.png';
import * as Yup from 'yup';

export const CheckoutForm = ({ clientSecret, paymentIntentId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { instance } = useMsal();
  const [guestUserEmail, saveGuestUserEmail] = useLocalStorage('guestUserEmail', null);
  const [cardHolderName, setCardHolderName] = useState(null);
  const [cardHolderNameError, setCardHolderNameError] = useState(null);

  const validationSchema = Yup.object({
    cardHolderName: Yup.string().trim().required('Cardholder Name is required')
  });

  const handleChangeCardHolderName = (e) => {
    const trimmedValue = e.target.value.trim();
    setCardHolderName(trimmedValue);
    setCardHolderNameError('');
  };

  const [cardNumberError, setCardNumberError] = useState(null);
  const [cardExpiryError, setCardExpiryError] = useState(null);
  const [cardCvcError, setCardCvcError] = useState(null);

  const handleCardNumberChange = (event) => {
    if (event.error) {
      setCardNumberError(event.error.message);
    } else {
      setCardNumberError(null);
    }
  };

  const handleCardExpiryChange = (event) => {
    if (event.error) {
      setCardExpiryError(event.error.message);
    } else {
      setCardExpiryError(null);
    }
  };

  const handleCardCvcChange = (event) => {
    if (event.error) {
      setCardCvcError(event.error.message);
    } else {
      setCardCvcError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    try {
      await validationSchema.validate({ cardHolderName }, { abortEarly: false });
      const paymentResponse = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: cardHolderName
              ? cardHolderName
              : instance.getActiveAccount()?.idTokenClaims.name
              ? instance.getActiveAccount()?.idTokenClaims.name
              : ''
          }
        },
        return_url: `${window.location.origin}/completion`
      });
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Otherwise, your customer will be redirected to
      // your `return_url`. For some payment methods like iDEAL, your customer will
      // be redirected to an intermediate site first to authorize the payment, then
      // redirected to the `return_url`.
      if (paymentResponse?.error?.type && paymentResponse?.error?.type !== 'validation_error') {
        setMessage(paymentResponse?.error?.message);
      }
      setIsLoading(false);
      if (paymentResponse?.paymentIntent?.status === 'succeeded') {
        navigate('/thankyou', { state: { clientSecret: clientSecret, paymentIntentId: paymentIntentId } });
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        setCardHolderNameError(error.errors[0]);
      } else {
        setMessage('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  const cardNumberElementOptions = {
    style: {
      base: {
        lineHeight: '45px',
        fontFamily: 'Rubik, sans-serif',
        fontSize: '16px',
        fontWeight: '400',
        color: '#252729',

        '::placeholder': {
          color: '#5F646C'
        }
      }
    },
    showIcon: false,
    placeholder: 'Card Number'
  };
  const cardExpiryElementOptions = {
    style: {
      base: {
        lineHeight: '45px',
        fontFamily: 'Rubik, sans-serif',
        fontSize: '16px',
        fontWeight: '300',
        color: '#252729',

        '::placeholder': {
          color: '#5F646C'
        }
      }
    },
    showIcon: true
  };
  const cardCvcElementOptions = {
    style: {
      base: {
        lineHeight: '45px',
        fontFamily: 'Rubik, sans-serif',
        fontSize: '16px',
        fontWeight: '300',
        color: '#252729',

        '::placeholder': {
          color: '#5F646C',
          paddingLeft: '8px'
        }
      }
    },
    showIcon: true
  };
  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <Form.Group className="mb-3 mt-5 stripe-form-input">
        <div className="email-label-wrapper">
          <p className="email-label-text">
            <img src={WarningIcon} alt="warining-icon" className="pe-1 warning-icon" />
            Your stripe invoice will be sent to this email
          </p>
          <Form.Label className="stripe-form-input-label">Email</Form.Label>
        </div>

        <Form.Control
          type="email"
          className="stripe-form-input"
          readOnly
          value={
            instance.getActiveAccount()?.idTokenClaims.email
              ? instance.getActiveAccount()?.idTokenClaims.email
              : guestUserEmail
          }
        />
      </Form.Group>
      <div className="card-details-wrapper mb-3">
        <Form.Label className="stripe-form-input-label">Card Information</Form.Label>
        <div className="stripe-card card-number-wrapper">
          <div className="stripe-card-text">
            <CardNumberElement
              className="card-element"
              options={cardNumberElementOptions}
              onChange={handleCardNumberChange}
            />
          </div>
          <div className="card-icons">
            <img src={StripeCardsImg} alt="stripe-cars" className="stripe-cards-logos" />
          </div>
        </div>
        <div className="card-sub-details-wrapper">
          <div className="stripe-card card-number-half">
            <div className="stripe-card-text">
              <CardExpiryElement
                className="card-element"
                options={cardExpiryElementOptions}
                onChange={handleCardExpiryChange}
              />
            </div>
          </div>
          <div className="stripe-card card-number-half cvc-input">
            <div className="stripe-card-text">
              <CardCvcElement className="card-element" options={cardCvcElementOptions} onChange={handleCardCvcChange} />
            </div>
          </div>
        </div>
      </div>
      {/* Show any error or success messages */}
      {cardNumberError && (
        <div id="cardNumberError-message" className="payment-message">
          {cardNumberError}
        </div>
      )}
      {cardExpiryError && (
        <div id="cardExpiryError-message" className="payment-message">
          {cardExpiryError}
        </div>
      )}
      {cardCvcError && (
        <div id="cardCvcError-message" className="payment-message">
          {cardCvcError}
        </div>
      )}
      <Form.Group className="mb-3 stripe-form-input">
        <Form.Label className="stripe-form-input-label">Cardholder Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter Name"
          className={`stripe-form-input ${cardHolderNameError ? 'invalid-input-values' : ''}`}
          onChange={handleChangeCardHolderName}
        />
        {cardHolderNameError && <div className="payment-message">{cardHolderNameError}</div>}
      </Form.Group>
      <button disabled={isLoading || !stripe || !elements} id="submit" className="stripe-form-submit mt-4">
        {isLoading ? (
          <span className="spinner-wrapper">
            <Spinner animation="border" variant="light" />
            <div className="ps-3">Processing…</div>
          </span>
        ) : (
          <span>Pay</span>
        )}
      </button>
      {message && (
        <div id="error-message" className="payment-message">
          {message}
        </div>
      )}
    </form>
  );
};
