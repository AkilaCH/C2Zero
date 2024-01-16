import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { checkAPiHealth } from '../../services/authService';
import { appProperties } from '../../util/appProperties';
import NotificationToast from '../NotificationToast';
import Countdown from 'react-countdown';
import moment from 'moment';
import { NavLink } from 'react-router-dom';
import { AppContextProvider } from '../../contexts/AppContext';
import { checkCurrentUserAccountStatus } from '../../common/userStatusChecker';

const PageLayout = ({ children, instance }) => {
  const [notification, setNotificationMessage] = useState(null);
  const [currentUserAccountStatus, setCurrentUserAccountStatus] = useState(null);

  const checkBackend = async () => {
    try {
      await checkAPiHealth();
    } catch (error) {
      setNotifications('error', appProperties.serviceUnavailable);
    }
  };

  const setNotifications = async (type, message) => {
    setNotificationMessage({ type: type, message: message });
    window.scrollTo(0, 0);
  };

  // Renderer callback with condition
  const renderer = ({ hours, minutes, seconds, completed }) => {
    if (!completed) {
      return (
        <span className="countdown">
          {hours}h {minutes}m {seconds}s
        </span>
      );
    }
  };

  useEffect(() => {
    checkBackend();
    if (instance.getAllAccounts().length > 0) {
      const getStatus = async () => {
        try {
          const result = await checkCurrentUserAccountStatus(instance);
          setCurrentUserAccountStatus(result);
        } catch (e) {
          setNotifications('error', e);
        }
      };
      getStatus();
    }
    //eslint-disable-next-line
  }, []);

  const showAccountDeletionTime =
    currentUserAccountStatus?.isUserExist && currentUserAccountStatus?.isUserDeleteRequested
      ? moment
          .utc(new Date(currentUserAccountStatus?.userDeleteExecutionTime).toString())
          .local()
          .format('YYYY-MM-DDTHH:mm:ss')
      : null;

  return (
    <div className={showAccountDeletionTime ? 'page-layout delete-nav' : 'page-layout'}>
      <AppContextProvider
        value={{
          currentUserAccountStatus,
          setCurrentUserAccountStatus
        }}
      >
        {showAccountDeletionTime && (
          <div className="account-delete-notification">
            <span>Your account will be deleted in</span>
            <Countdown date={showAccountDeletionTime} renderer={renderer} />
            {window.location.pathname !== '/myprofile' && (
              <span>
                <NavLink to="/myprofile">Recover Account</NavLink>
              </span>
            )}
          </div>
        )}
        {notification && (
          <NotificationToast
            toastType={notification.type}
            message={notification.message}
            callBack={() => setNotificationMessage(null)}
          />
        )}
        {children}
      </AppContextProvider>
    </div>
  );
};

export default PageLayout;
