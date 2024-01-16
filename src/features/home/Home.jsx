import React from 'react';
import logo from '../../assets/images/logo_white.svg';
import { SigninSignup } from '../../components/SigninSignup';

const Home = ({ instance }) => {
  return (
    <div>
      <div className="authentication">
        <div className="container">
          <div className="authentication-wrapper">
            <div className="welcome">
              <div className="welcome-content">
                <img src={logo} alt="c20 logo" className="logo" />
                <h2>Welcome to C2Zero</h2>
                <p className="saying-text">We’re hijacking the carbon system for good.</p>
              </div>
            </div>
            <SigninSignup instance={instance} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
