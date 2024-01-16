import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';

import Home from '../features/home/Home';
import AddToTally from '../features/claim/AddToTally';
import Claim from '../features/claim/Claim';
import Dashboard from '../features/dashboard/Dashboard';

import '../styles/style.scss';
import './App.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { AuthInteceptor } from '../components/authInterceptor';
import MyProfile from '../features/myProfile/MyProfile';
import AllTransactions from '../features/allTransactions/AllTransactions';
import PageLayout from '../components/layouts/PageLayout';
import RouteMiddleware from '../components/RouteMiddleware';
import { ThankyouPage } from '../components/ThankyouPage';
import VerifyGuest from '../features/continueAsGuest/VerifyGuest';
import BuyCarbonCertificateForm from '../features/BuyCertificates/BuyCarbonCertificateForm';
import OrderHistory, { OrderHistoryAuthenticatedWrapper } from '../features/continueAsGuest/OrderHistory';
import { loadStripe } from '@stripe/stripe-js';
import { appProperties } from '../util/appProperties';
import PaymentPage from '../features/BuyCertificates/PaymentPage';
import { ToastContainer } from 'react-toastify';

const stripePromise = loadStripe(appProperties.stripeKey);

const Pages = ({ instance, fullStoryInstance }) => {
  return (
    <Routes>
      <Route
        exact
        path="/"
        element={
          <>
            <AuthenticatedTemplate>
              <Dashboard instance={instance} />
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
              <Home instance={instance} />
            </UnauthenticatedTemplate>
          </>
        }
      />
      <Route
        path="/dashboard"
        element={
          <AuthInteceptor>
            <Dashboard instance={instance} />
          </AuthInteceptor>
        }
      />
      <Route
        path="/myprofile"
        element={
          <AuthInteceptor>
            <MyProfile instance={instance} />
          </AuthInteceptor>
        }
      />
      <Route
        path="/alltransactions"
        element={
          <AuthInteceptor>
            <AllTransactions />
          </AuthInteceptor>
        }
      />
      <Route
        path="/auth"
        element={
          <AuthInteceptor>
            <RouteMiddleware instance={instance} fullStoryInstance={fullStoryInstance} />
          </AuthInteceptor>
        }
      />
      <Route
        path="/claimAuth"
        element={
          <AuthInteceptor>
            <RouteMiddleware instance={instance} fullStoryInstance={fullStoryInstance} />
          </AuthInteceptor>
        }
      />
      <Route
        path="/OrderHistory"
        element={
          <>
            <AuthenticatedTemplate>
              <OrderHistoryAuthenticatedWrapper />
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
              <VerifyGuest />
            </UnauthenticatedTemplate>
          </>
        }
      />
      <Route path="/BuyCertificate" element={<BuyCarbonCertificateForm />} />
      <Route
        path="/:scanId/:slotId"
        element={
          <>
            <UnauthenticatedTemplate>
              <Claim instance={instance} />
            </UnauthenticatedTemplate>
            <AuthenticatedTemplate>
              <AddToTally instance={instance} />
            </AuthenticatedTemplate>
          </>
        }
      />
      <Route
        exact
        path="/*"
        element={
          <>
            <AuthenticatedTemplate>
              <Dashboard instance={instance} />
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
              <Home instance={instance} />
            </UnauthenticatedTemplate>
          </>
        }
      />
      <Route exact path="/checkout" element={<PaymentPage stripePromise={stripePromise} />} />
      <Route
        exact
        path="/thankyou"
        element={
          <>
            <ThankyouPage />
          </>
        }
      />
    </Routes>
  );
};

const App = ({ instance, fullStoryInstance }) => {
  return (
    <Router>
      <PageLayout instance={instance}>
        <Pages instance={instance} fullStoryInstance={fullStoryInstance} />
      </PageLayout>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
};

export default App;
