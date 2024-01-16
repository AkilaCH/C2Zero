import React from 'react';
import '../styles/style.scss';
import { useMsal } from '@azure/msal-react';
import {
  handleSignup,
  handleLogin,
  handleLogout,
  handleLoginFromClaim,
  handleSignupFromClaim
} from '../services/authService';

import iconArrowForward from '../assets/images/arrow-forward-icon.svg';
import { Link } from 'react-router-dom';

export const SigninSignup = (props) => {
  const instance = props.instance;
  return (
    <div className="signin">
      <div className="signin-content">
        {!props.scanId && (
          <p className="keep-track-text">Keep track of how you're helping the world go beyond neutral</p>
        )}
        <div className="button-wrapper">
          <button
            className="btn-default"
            onClick={() => (props.scanId ? handleSignupFromClaim(instance) : handleSignup(instance))}
          >
            Join C2Zero
          </button>
          <button
            className="btn-outline"
            onClick={() => (props.scanId ? handleLoginFromClaim(instance) : handleLogin(instance))}
          >
            Sign In
          </button>
        </div>
        <Link to="/OrderHistory" className="guest-link">Continue as Guest</Link>
        <div className="row">
          <p className="learn-more-text">
            Want to learn more? <a href="https://C2Zero.net">C2Zero.net</a> <br />
            Privacy policy <a href="https://portal.C2Zero.net/Privacy.html"> Privacy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export const SignOutButton = (props) => {
  const { instance } = useMsal();

  return (
    <React.Fragment>
      {props.fullbutton ? (
        <button className="btn-full" onClick={() => handleLogout(instance)}>
          <span>Sign Out</span> <img src={iconArrowForward} alt="arrow icon" />
        </button>
      ) : (
        <button className="btn-outline" onClick={() => handleLogout(instance)}>
          Sign out
        </button>
      )}
    </React.Fragment>
  );
};
