import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from 'react-bootstrap';

const VerificationCodeForm = ({ email }) => {
  const initialValues = {
    email: email,
    otp: ''
  };

  const validationSchema = Yup.object({
    otp: Yup.string().required('OTP code is required')
  });

  const onSubmit = (values, { setSubmitting }) => {
    // Handle form submission logic here
    console.log('Form submitted:', values);
    setSubmitting(false);
  };

  const handleResendCode = () => {
    // Handle resend code logic here
    console.log('Resend code');
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
      <Form>
        <div>
          <label>Email:</label>
          <Field type="email" name="email" disabled />
          <ErrorMessage name="email" component="div" />
        </div>

        <div>
          <label>OTP Code:</label>
          <Field type="text" name="otp" />
          <ErrorMessage name="otp" component="div" />
        </div>

        <Button type="submit">Submit</Button>

        <Button onClick={handleResendCode}>Resend Code</Button>
      </Form>
    </Formik>
  );
};

export default VerificationCodeForm;
