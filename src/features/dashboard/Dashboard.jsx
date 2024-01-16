import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import { appProperties } from '../../util/appProperties';
import { getAllTransactionsService } from '../../services/claimService';
import logo_dark from '../../assets/images/logo_black.svg';
import shareIcon from '../../assets/images/share.svg';
import userIcon from '../../assets/images/user-icon.svg';
import arrowIcon from '../../assets/images/arrow.svg';
import TransactionItem from '../allTransactions/TransactionItem';
import TransactionModal from '../allTransactions/TransactionModal';
import Factory from '../../assets/images/factory.svg';
import Skeleton from 'react-loading-skeleton';
import { getSubscription } from '../../services/mailChimpService';
import { formatDate } from '../../common/formatter';
import AppContext from '../../contexts/AppContext';
import { useContext } from 'react';
import { checkCurrentUserAccountStatus } from '../../common/userStatusChecker';
import { toast } from 'react-toastify';

const Dashboard = ({ instance }) => {
  const { accounts } = useMsal();
  const navigate = useNavigate();
  const [qty, setQty] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isSingleTx, setIsSingleTx] = useState(false);
  const applicationContext = useContext(AppContext);
  const { currentUserAccountStatus, setCurrentUserAccountStatus } = applicationContext;

  const [singleTx, setSingleTx] = useState({
    vendorDisplayName: '',
    productDisplayName: '',
    createdDate: '',
    quantity: '',
    quantityUnit: '',
    vendorLogoUrl: ''
  });
  const [transactionsData, setTransactionsData] = useState(null);
  const [err, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    total: 0,
    pagingFlag: false,
    tonnes: 0,
    kiloGram: 0,
    gram: 0
  });
  const [isGetAllTransactionsApiInProgress, setGetAllTransactionsnApiInProgress] = useState(true);
  const pageNumber = 1;
  const pageSize = 6;

  const openTx = () => {
    setQty(dashboardData.total);
    setIsSingleTx(false);
    setShowModal(true);
  };

  const handleModalShow = () => {
    setIsSingleTx(true);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const navigateToAllTransactionsView = () => {
    navigate('/alltransactions');
  };

  const goToMyProfile = async () => {
    navigate('/myprofile');
  };
  const goToECertificateOrderHistory = () => {
    navigate('/OrderHistory');
  };
  const handleHowItWorksBtnClick = () => {
    /**
     * todo:
     * confirm from design team what exactly should be done here
     */
  };

  useEffect(() => {
    setCurrentUserAccountStatus({ ...currentUserAccountStatus, location: '/dashboard' });

    const getSubscriptions = async () => {
      try {
        const response = await getSubscription(instance, appProperties.apiHost);
        if (response) {
          localStorage.setItem('subscribed', response.subscriptionStatus === 'Subscribed');
        }
      } catch (error) {
        setError(error);
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    };

    const getAllTransactions = async () => {
      let transactionDetails = null;
      let transactionDetailErr = null;
      try {
        setGetAllTransactionsnApiInProgress(true);
        const resp = await getAllTransactionsService(instance, appProperties.apiHost, pageNumber, pageSize);
        transactionDetails = resp || null;

        setTransactionsData(transactionDetails);
        if (transactionDetails && transactionDetails.totalTransactedCarbonValue) {
          setDashboardData({
            total: transactionDetails.totalTransactedCarbonValue,
            pagingFlag: transactionDetails.userTransactions.length > 5,
            tonnes: transactionDetails.totalTransactedCarbonValue.tonne
              ? transactionDetails.totalTransactedCarbonValue.tonne
              : 0,
            kiloGram: transactionDetails.totalTransactedCarbonValue.kilogram
              ? transactionDetails.totalTransactedCarbonValue.kilogram
              : 0,
            gram: transactionDetails.totalTransactedCarbonValue.gram
              ? transactionDetails.totalTransactedCarbonValue.gram
              : 0
          });
        }
      } catch (error) {
        transactionDetailErr = true;
        setError(error);
      } finally {
        if (transactionDetails || transactionDetailErr) {
          setGetAllTransactionsnApiInProgress(false);
        }
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    };
    if (!localStorage.getItem('subscribed')) {
      getSubscriptions();
    }
    getAllTransactions();

    if (!currentUserAccountStatus) {
      const getStatus = async () => {
        const result = await checkCurrentUserAccountStatus(instance);
        setCurrentUserAccountStatus(result);
      };
      getStatus();
    }
    // eslint-disable-next-line
  }, [accounts, navigate, instance]);

  useEffect(() => {
    if (err && err?.title)
      toast.error(err.title, {
        onClose: () => setError(null)
      });
  }, [err]);

  return (
    <div>
      <div className="home-page-dashboard">
        <div className="home-nav">
          <div className="container">
            <div className="home-nav-wrapper">
              <img src={logo_dark} alt="logo dark" className="logo" />
              <button onClick={goToMyProfile} className="btn-outline icon-left-btn">
                <img src={userIcon} alt="profile icon" />
                My Profile
              </button>
            </div>
          </div>
        </div>
        <div className="dashboard-info">
          <h2>
            {isGetAllTransactionsApiInProgress ? (
              <Skeleton duration={2} width={212} height={22} />
            ) : (
              'Total CO2e Eliminated'
            )}
          </h2>
          <div className="data">
            <h3>
              {isGetAllTransactionsApiInProgress ? (
                <Skeleton duration={2} width={63.25} height={81.6} />
              ) : (
                <React.Fragment>
                  {dashboardData.tonnes}
                  <span>tonnes</span>
                </React.Fragment>
              )}
            </h3>
            <h3>
              {isGetAllTransactionsApiInProgress ? (
                <Skeleton duration={2} width={63.25} height={81.6} />
              ) : (
                <React.Fragment>
                  {dashboardData.kiloGram}
                  <span>kilograms</span>
                </React.Fragment>
              )}
            </h3>
            <h3>
              {isGetAllTransactionsApiInProgress ? (
                <Skeleton duration={2} width={63.25} height={81.6} />
              ) : (
                <React.Fragment>
                  {dashboardData.gram}
                  <span>grams</span>
                </React.Fragment>
              )}
            </h3>
          </div>
        </div>
        <div className="btn-wrapper">
          {isGetAllTransactionsApiInProgress ? (
            <Skeleton duration={2} width={150} height={36} />
          ) : (
            transactionsData &&
            transactionsData.userTransactions.length > 0 && (
              <button className="btn-share" onClick={openTx}>
                <img src={shareIcon} alt="share icon" />
                Share Total
              </button>
            )
          )}
        </div>

        <div className="recent-transactions">
          <div className="recent-transactions--header">
            {isGetAllTransactionsApiInProgress ? (
              <Skeleton duration={2} width={150} height={16} />
            ) : (
              transactionsData && transactionsData.userTransactions.length > 0 && <label>Recent Transactions</label>
            )}

            {isGetAllTransactionsApiInProgress ? (
              <Skeleton duration={2} width={150} height={16} />
            ) : (
              dashboardData.pagingFlag && (
                <span onClick={navigateToAllTransactionsView}>
                  View All <img src={arrowIcon} alt="arrow icon" />
                </span>
              )
            )}
          </div>
          <div className="recent-transactions--body">
            {isGetAllTransactionsApiInProgress ? (
              <React.Fragment>
                <Skeleton duration={2} height={83} />
                <Skeleton duration={2} height={83} />
                <Skeleton duration={2} height={83} />
                <Skeleton duration={2} height={83} />
                <Skeleton duration={2} height={83} />
              </React.Fragment>
            ) : (
              <React.Fragment>
                {transactionsData && transactionsData.userTransactions.length > 0 ? (
                  <React.Fragment>
                    {transactionsData.userTransactions.slice(0, 5).map((t, index) => (
                      <TransactionItem
                        index={index}
                        key={t.id}
                        image={t.vendorLogoUrl}
                        date={formatDate(t.createdOn)}
                        name={t.vendorDisplayName}
                        type={t.productDisplayName}
                        weight={t.quantity}
                        unit={t.quantityUnit}
                        normalizedQty={t.quantityNormalizedValue}
                        handleShow={handleModalShow}
                        setQty={setQty}
                        setSingleTx={setSingleTx}
                      />
                    ))}
                  </React.Fragment>
                ) : (
                  <div className="empty-dashboard-msg">
                    <img src={Factory} alt="factory img" />
                    <h2>Join the fight to stop pollution!</h2>
                    <p>
                      Look for C2zero when you shop and know good companies and brands that display C2Zero are stopping
                      big polluters from releasing C02 into the earth’s atmosphere, forever!
                    </p>
                    <div className="row">
                      <div className="text-center">
                        <a
                          className="btn btn-primary btn-lg btn-default order-btn"
                          onClick={goToECertificateOrderHistory}
                        >
                          E-certificate order history
                        </a>
                        <a className="btn-default find-it-btn" href="https://www.c2zero.net/how-it-works">
                          Find How It Works
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {isGetAllTransactionsApiInProgress ? (
                  <Skeleton duration={2} width={150} height={16} />
                ) : (
                  dashboardData.pagingFlag && (
                    <button className="btn-outline icon-right-btn" onClick={navigateToAllTransactionsView}>
                      View All <img src={arrowIcon} alt="arrow icon" />
                    </button>
                  )
                )}
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <TransactionModal
          closeModal={handleModalClose}
          showModal={showModal}
          quantity={qty}
          isSingleTx={isSingleTx}
          singleTx={singleTx}
        />
      )}
    </div>
  );
};

export default Dashboard;
