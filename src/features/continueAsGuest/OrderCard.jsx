import Card from 'react-bootstrap/Card';
import { Button } from 'react-bootstrap';
import SendIcon from '../../assets/images/send.png';
import { resendExistingECertificate } from '../../services/eCertificateService';
import { useEffect, useState } from 'react';
import { ApiError } from '../../util/errorClassess';
import { toast } from 'react-toastify';

export const OrderCard = ({ orderNumber, price, referenceInstrument, isCompleted, quantity }) => {
  const [resendECertificateAPIError, setResendECertificateAPIError] = useState(false);
  const [resendECertificateAPIErrorMessage, setResendECertificateAPIErrorMessage] = useState(null);
  const [resendECertificateAPISuccess, setResendECertificateAPISuccess] = useState(false);
  const [resendECertificateInProgress, setResendECertificateInProgress] = useState(false);

  const resendECertificateHandler = async () => {
    setResendECertificateInProgress(true);
    try {
      const response = await resendExistingECertificate(orderNumber);
      if (response) {
        setResendECertificateAPISuccess(true);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`${error.name} - ${error.message}`);
        console.error(`Status Code: ${error.statusCode}`);
        setResendECertificateAPIErrorMessage(error.message);
      } else {
        console.error('Unexpected error:', error);
        setResendECertificateAPIErrorMessage('Unexpected error');
      }
      setResendECertificateAPIError(true);
    } finally {
      setResendECertificateInProgress(false);
    }
  };

  useEffect(() => {
    if (resendECertificateAPIError)
      toast.error(resendECertificateAPIErrorMessage, {
        onClose: () => setResendECertificateAPIError(false)
      });
    if (resendECertificateAPISuccess)
      toast.success('Resending eCertificate Successful', {
        onClose: () => setResendECertificateAPISuccess(false)
      });
  }, [resendECertificateAPIError, resendECertificateAPISuccess]);

  return (
    <Card className="m-2">
      <Card.Body className="order-history-card">
        <div className="history-card-header">
          <div className="title-section">
            <div className="title">
              <label className="title-label bold-text">Order Number</label>
              <div className="order-number-mobile bold-text mb-3">{orderNumber}</div>
            </div>
            <div>
              <div className="order-number bold-text">{orderNumber}</div>
              <div className="status-pending mobile-status d-lg-none d-sm-flex">
                {isCompleted ? 'Completed' : 'Pending'}
              </div>
            </div>
          </div>
        </div>
        <div className="horizonal-dash-line pt-3"></div>
        <div className="histroy-card-body pt-3">
          <div className="order-section py-3">
            <div className="d-flex flex-column">
              <label className="order-title-label small-text">Carbon Quantity</label>
              <label className="title-label-two bold-text">{quantity}</label>
            </div>

            <div className="wr-price">
              <label className="order-title-label small-text">Price</label>
              <div className="order-number bold-text">£{price}</div>
            </div>
          </div>

          <div className="wr-reference mb-3">
            <label className="order-title-label">reference instrument</label>
            <div className="bold-text">{referenceInstrument}</div>
          </div>
        </div>

        <div className="resend-btn-wrapper pt-1">
          <div className="status-pending d-none d-lg-flex d-sm-none">{isCompleted ? 'Completed' : 'Pending'}</div>
          <div>
            {isCompleted && (
              <Button
                className="resend-btn"
                onClick={() => resendECertificateHandler()}
                disabled={resendECertificateInProgress}
              >
                <img src={SendIcon} alt="send-btn-icon" /> Resend eCertificate
              </Button>
            )}
          </div>
        </div>

        <div className="resend-btn-wrapper-mobile mt-5">
          {isCompleted && (
            <Button
              className="resend-btn"
              onClick={() => resendECertificateHandler()}
              disabled={resendECertificateInProgress}
            >
              <img src={SendIcon} alt="send-btn-icon" /> Resend eCertificate
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};
