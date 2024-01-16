import React, { useState, useEffect, useContext } from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import {
  handleProfileEdit,
  handleChangePassword,
  getEditedProfile,
  isUpdated,
  softDeleteUser,
  revertUserSoftDeleteAction
} from '../../services/authService';
import { checkCurrentUserAccountStatus } from '../../common/userStatusChecker';
import { SignOutButton } from '../../components/SigninSignup';
import iconArrowForward from '../../assets/images/arrow-forward-icon.svg';
import editicon from '../../assets/images/pen-icon.svg';
import arrowIcon from '../../assets/images/arrow.svg';
import { appProperties } from '../../util/appProperties';
import { getSubscription, updateSubscription } from '../../services/mailChimpService';
import Skeleton from 'react-loading-skeleton';
import { SkeletonTheme } from 'react-loading-skeleton';
import { Button, Modal } from 'react-bootstrap';
import AppContext from '../../contexts/AppContext';
import { toast } from 'react-toastify';

const ConfirmAction = ({ show, handleClose, onActionConfirm, content, action }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Body>
        <p>{content}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button className="btn-danger" onClick={onActionConfirm}>
          {action}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const MyProfile = ({ instance }) => {
  const { accounts } = useMsal();
  const navigate = useNavigate();
  const applicationContext = useContext(AppContext);
  const { currentUserAccountStatus, setCurrentUserAccountStatus } = applicationContext;
  const [isChecked, setIsChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [isGetUserApiInProgress, setGetUserApiInProgress] = useState(true);
  const [edited, setEdited] = useState(false);
  const [isGetSubscriptionsApiInProgress, setGetSubscriptionsApiInProgress] = useState(true);
  const [err, setError] = useState(null);
  const [confirmActionModalKey, setConfirmActionModalKey] = useState(new Date().toISOString() + 1);
  const [confirmActionBool, setConfirmActionBool] = useState(false);
  const isUserDeleteRequested =
    currentUserAccountStatus?.isUserExist && currentUserAccountStatus?.isUserDeleteRequested;
  /**
 * 
 * todo: how to migrate this change to v6
 *  const params = new URLSearchParams(window.location.search);
    navigate({
      search: params.toString(),
      replace: true
    });
 */

  useEffect(() => {
    setCurrentUserAccountStatus({ ...currentUserAccountStatus, location: '/myprofile' });

    const checkUpdated = (user, prevUser) => {
      if (accounts.length > 1) {
        if (isUpdated(user, prevUser)) {
          setEdited(true);

          setTimeout(() => {
            setEdited(false);
          }, 5000);
        } else {
          setEdited(false);
        }
      }
    };

    const getUser = async () => {
      try {
        setGetUserApiInProgress(true);
        const user = await getEditedProfile(instance);
        setUser(user || null);
        if (localStorage.getItem('claimList') !== null && localStorage.getItem('claimList') !== undefined) {
          checkUpdated(user, JSON.parse(localStorage.getItem('claimList')));
          localStorage.setItem('claimList', JSON.stringify(user));
        } else {
          localStorage.setItem('claimList', JSON.stringify(user));
        }
      } catch (error) {
        console.log(error);
        setTimeout(() => {
          setError(null);
        }, 5000);
      } finally {
        setGetUserApiInProgress(false);
      }
    };

    const getSubscriptions = async () => {
      try {
        setGetSubscriptionsApiInProgress(true);
        const response = await getSubscription(instance, appProperties.apiHost);
        if (response) {
          setIsChecked(response.subscriptionStatus === 'Subscribed');
          localStorage.setItem('subscribed', response.subscriptionStatus === 'Subscribed');
        }
      } catch (error) {
        setError(error);

        setTimeout(() => {
          setError(null);
        }, 5000);
      } finally {
        setGetSubscriptionsApiInProgress(false);
      }
    };

    getUser();
    if (!localStorage.getItem('subscribed')) {
      getSubscriptions();
    } else {
      setIsChecked(JSON.parse(localStorage.getItem('subscribed')));
      setGetSubscriptionsApiInProgress(false);
    }

    if (!currentUserAccountStatus) {
      const getStatus = async () => {
        let status = await checkCurrentUserAccountStatus(instance);
        setCurrentUserAccountStatus({ ...status, location: '/myprofile' });
      };
      getStatus();
    }
    //eslint-disable-next-line
  }, [accounts, instance]);

  useEffect(() => {
    if (err && err.title)
      toast.error(err.title, {
        onClose: () => setError(null)
      });
    if (edited)
      toast.success('Profile updated successfully', {
        onClose: () => setEdited(false)
      });
  }, [edited, err]);

  const handleSubscription = async () => {
    try {
      setIsChecked(!isChecked);
      const response = await updateSubscription(instance, appProperties.apiHost);
      if (response) {
        setIsChecked(response.subscriptionStatus === 'Subscribed');
        localStorage.setItem('subscribed', response.subscriptionStatus === 'Subscribed');
      }
    } catch (error) {
      setError(error);
      setIsChecked(!isChecked);
      localStorage.setItem('subscribed', false);

      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const handleUserAccountStatus = () => {
    if (isUserDeleteRequested) {
      revertAccountDeletion();
    } else {
      requestAccountDeletion();
    }
  };

  const requestAccountDeletion = async () => {
    try {
      const response = await softDeleteUser(instance, appProperties.apiHost);
      if (response) {
        let status = await checkCurrentUserAccountStatus(instance);
        if (status) {
          setCurrentUserAccountStatus({ ...status, location: '/myprofile' });
        }
      }
      setConfirmActionBool(false);
    } catch (error) {
      setTimeout(() => setError(null), 5000);
    }
  };

  const revertAccountDeletion = async () => {
    try {
      const response = await revertUserSoftDeleteAction(instance, appProperties.apiHost);
      if (response) {
        let status = await checkCurrentUserAccountStatus(instance);
        if (status) {
          setCurrentUserAccountStatus({ ...status, location: '/myprofile' });
        }
        setConfirmActionBool(false);
      }
    } catch (error) {
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <SkeletonTheme color="#05c3a6" highlightColor="#00e1be">
      <div className="container small-container">
        <div className="c2zero-navbar">
          <span onClick={() => navigate(-1)}>
            <img src={arrowIcon} alt="arrow icon" />
          </span>
          <h1>My Profile</h1>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <div className="card profile-card">
              <div className="card-body">
                {isGetUserApiInProgress ? (
                  <Skeleton duration={2} width={180} height={16} />
                ) : (
                  <h5 className="card-title">{user && user.otherMails.length > 0 ? user.otherMails[0] : ''}</h5>
                )}
                {isGetUserApiInProgress ? (
                  <Skeleton duration={2} width={180} height={16} />
                ) : (
                  <p className="card-text joined">
                    {user && user.extension_JoinedDate ? 'Joined ' + user.extension_JoinedDate : ''}
                  </p>
                )}
                {isGetUserApiInProgress ? (
                  <Skeleton duration={2} width={180} height={16} />
                ) : (
                  <p className="card-text">
                    <b>Birth Year</b> {user && user.extension_BirthYear ? user.extension_BirthYear : '-'}
                  </p>
                )}
                {isGetUserApiInProgress ? (
                  <Skeleton duration={2} width={180} height={16} />
                ) : (
                  <p className="card-text">
                    <b>Gender</b> {user && user.extension_Gender ? user.extension_Gender : '-'}
                  </p>
                )}
                <button className="btn-outline icon-left-btn" onClick={() => handleProfileEdit(instance)}>
                  <img src={editicon} alt="edit icon" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
        {!isGetSubscriptionsApiInProgress ? (
          <div className="row">
            <div className="col-12">
              <div className="newsletter-offers">
                <div className="text">
                  <label>Newsletter &amp; Offers</label>
                  <span>Receive the latest updates and exclusive offers from our partners</span>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={isChecked} onChange={handleSubscription} />
                  <span className="slider round"></span>)
                </label>
              </div>
              {user && !user.idp && (
                <button className="btn-full" onClick={() => handleChangePassword(instance)}>
                  <span>Change Password</span> <img src={iconArrowForward} alt="arrow icon" />
                </button>
              )}
              {isUserDeleteRequested ? (
                <button
                  className="btn-full"
                  onClick={() => {
                    setConfirmActionBool(true);
                    setConfirmActionModalKey(new Date().toISOString());
                  }}
                >
                  <span>Recover Your Account</span> <img src={iconArrowForward} alt="arrow icon" />
                </button>
              ) : (
                <button
                  className="btn-full"
                  onClick={() => {
                    setConfirmActionBool(true);
                    setConfirmActionModalKey(new Date().toISOString());
                  }}
                >
                  <span>Delete Your Account</span> <img src={iconArrowForward} alt="arrow icon" />
                </button>
              )}
              <SignOutButton fullbutton="true" />
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
      <ConfirmAction
        className="btn-default"
        key={confirmActionModalKey}
        show={confirmActionBool}
        content={`Are you sure want to ${isUserDeleteRequested ? 'recover' : 'delete'} your account?`}
        action="Confirm"
        onActionConfirm={handleUserAccountStatus}
        handleClose={() => setConfirmActionBool(false)}
      />
    </SkeletonTheme>
  );
};

export default MyProfile;
