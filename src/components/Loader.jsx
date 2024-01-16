import React from 'react';
import logo from '../assets/images/logo_white.svg';
import { Spinner } from 'react-bootstrap';
import '../styles/style.scss';

const Loader = () => {
  return (
    <div className="loader">
      <img src={logo} alt="c20 logo" className="loader-logo" />
      <br />
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default Loader;
