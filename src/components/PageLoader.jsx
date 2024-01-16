import React from 'react';
import logoGIF from '../../src/assets/images/Logo_GIF_Tagline.gif';

const PageLoader = () => {
  return (
    <div className="page-loader">
      <img src={logoGIF} alt="logo GIF" />
    </div>
  );
};

export default PageLoader;
