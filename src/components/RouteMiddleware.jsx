import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { appProperties } from '../util/appProperties';
import { addSubscription } from '../services/mailChimpService';
import PageLoader from './PageLoader';

const RouteMiddleware = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === '/auth' && props.instance.getActiveAccount()) {
      navigate('/');
    } else if (location.pathname === '/claimAuth' && props.instance.getActiveAccount()) {
      const claimCarbon = async () => {
        try {
          const resp = await addSubscription(props.instance, appProperties.apiHost);
          if (resp) {
            if (location.pathname === '/claimAuth') {
              let claimId = localStorage.getItem('claimUrl');
              localStorage.removeItem('claimUrl');
              navigate('/' + claimId);
            } else {
              navigate('/dashboard');
            }
          } else {
            navigate('/');
          }
        } catch (error) {
          navigate('/');
        }
      };
      claimCarbon();
    } else {
      navigate('/');
    }
  }, [props.instance]);

  return <PageLoader />;
};

export default RouteMiddleware;
