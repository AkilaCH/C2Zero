import React, { useState } from 'react';
import EmailVerificationForm from './EmailVerificationForm';
// import VerificationCodeForm from './VerificationCodeForm';
import OrderHistory from './OrderHistory';

function VerifyGuest() {
  const [submittedEmail, setSubmittedEmail] = useState(null);

  return (
    <div className="verify-guest">
      {submittedEmail ? (
        <OrderHistory userEmail={submittedEmail} />
      ) : (
        <EmailVerificationForm setSubmittedEmail={setSubmittedEmail} />
      )}
    </div>
  );
}

export default VerifyGuest;
