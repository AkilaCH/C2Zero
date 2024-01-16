import { useState, useEffect, useReducer } from 'react';
import Button from 'react-bootstrap/Button';
import { OrderCard } from './OrderCard';
import { Navigate, useNavigate } from 'react-router';
import darkLogo from '../../assets/images/logo_black.svg';
import { Dropdown, DropdownButton, Spinner } from 'react-bootstrap';
import { getEcertificateOrderHistory } from '../../services/eCertificateService';
import { useInView } from 'react-intersection-observer';
import { useMediaQuery } from 'react-responsive';
import { AuthenticatedTemplate, useMsal } from '@azure/msal-react';
import CheveronDown from '../../assets/images/dropdown-cheveron.png';
import NoResultFoundIcon from '../../assets/images/No-result found Icon.png';
import OrderHistoryEmptyIcon from '../../assets/images/Order-histrory-empty-icon.png';
import BackBtn from '../../assets/images/back-btn.png';
import { convertUnits } from '../../common/formatter';
import { ApiError } from '../../util/errorClassess';
import { purchasedECertificateOrderStatus } from '../../util/constants';
import { toast } from 'react-toastify';

const orderHistoryStateReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_ORDERS_INIT':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_ORDERS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        data: [...state.data, ...action.payload.paginatedList],
        currentPage: action.payload.pageNumber,
        nextPage:
          Math.ceil(action.payload.totalCount / action.payload.pageCount) > action.payload.pageNumber
            ? Number(action.payload.pageNumber) + 1
            : Number(action.payload.pageNumber),
        hasMore:
          Math.ceil(action.payload.totalCount / action.payload.pageCount) > action.payload.pageNumber ? true : false
      };
    case 'SEARCH_ORDERS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        data: [...action.payload.paginatedList],
        currentPage: action.payload.pageNumber,
        nextPage:
          Math.ceil(action.payload.totalCount / action.payload.pageCount) > action.payload.pageNumber
            ? Number(action.payload.pageNumber) + 1
            : Number(action.payload.pageNumber),
        hasMore:
          Math.ceil(action.payload.totalCount / action.payload.pageCount) > action.payload.pageNumber ? true : false
      };
    case 'FETCH_ORDERS_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'FETCH_ORDERS_FAILURE_RESET':
      return { ...state, error: null };
    default:
      return state;
  }
};

const OrderHistory = ({ userEmail }) => {
  const navigate = useNavigate();
  const [ref, inView] = useInView({
    threshold: 0
  });
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const [orderHistoryState, dispatch] = useReducer(orderHistoryStateReducer, {
    data: [],
    currentPage: 1,
    nextPage: 1,
    isLoading: false,
    error: null,
    hasMore: true
  });
  const [orderNumber, setOrderNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState(purchasedECertificateOrderStatus.ALL);

  useEffect(() => {
    const fetchOrderHistoryData = async () => {
      try {
        dispatch({ type: 'FETCH_ORDERS_INIT' });

        const email = userEmail;
        const pageNumber = orderHistoryState?.nextPage;
        const pageSize = isTabletOrMobile ? 3 : 10; // change page size on mobile devices
        const searchKeyword = orderNumber;
        const orderStatusFilter =
          orderStatus !== purchasedECertificateOrderStatus.ALL
            ? [
                {
                  key: 'status',
                  value: orderStatus
                }
              ]
            : [];

        const data = await getEcertificateOrderHistory(email, pageNumber, pageSize, searchKeyword, orderStatusFilter);
        dispatch({ type: 'FETCH_ORDERS_SUCCESS', payload: data });
      } catch (error) {
        if (error instanceof ApiError) {
          console.error(`${error.name} - ${error.message}`);
          console.error(`Status Code: ${error.statusCode}`);
          dispatch({ type: 'FETCH_ORDERS_FAILURE', payload: error.message });
        } else {
          console.error('Unexpected error:', error);
          dispatch({ type: 'FETCH_ORDERS_FAILURE', payload: error });
        }
      }
    };

    if (inView && !orderHistoryState.isLoading && orderHistoryState.hasMore) {
      fetchOrderHistoryData();
    }
  }, [inView]);

  useEffect(() => {
    const fetchOrderHistoryData = async () => {
      try {
        dispatch({ type: 'FETCH_ORDERS_INIT' });

        const email = userEmail;
        const pageNumber = 1;
        const pageSize = isTabletOrMobile ? 3 : 10; // change page size on mobile devices
        const searchKeyword = orderNumber;
        const orderStatusFilter =
          orderStatus !== purchasedECertificateOrderStatus.ALL
            ? [
                {
                  key: 'status',
                  value: orderStatus
                }
              ]
            : [];

        const data = await getEcertificateOrderHistory(email, pageNumber, pageSize, searchKeyword, orderStatusFilter);
        dispatch({ type: 'SEARCH_ORDERS_SUCCESS', payload: data });
      } catch (error) {
        if (error instanceof ApiError) {
          console.error(`${error.name} - ${error.message}`);
          console.error(`Status Code: ${error.statusCode}`);
          dispatch({ type: 'FETCH_ORDERS_FAILURE', payload: error.message });
        } else {
          console.error('Unexpected error:', error);
          dispatch({ type: 'FETCH_ORDERS_FAILURE', payload: error });
        }
      }
    };

    if (!orderHistoryState.isLoading) {
      fetchOrderHistoryData();
    }
  }, [orderNumber, orderStatus]);

  useEffect(() => {
    if (orderHistoryState?.error)
      toast.error(orderHistoryState?.error, {
        onClose: () => resetFetchOrderFailure()
      });
  }, [orderHistoryState]);

  const handleBuyECertificateBtnClick = () => {
    navigate('/BuyCertificate');
  };
  const handleOnChangeSearch = (e) => {
    setOrderNumber(e.target.value);
  };
  const goToMyProfile = async () => {
    navigate('/myprofile');
  };

  const resetFetchOrderFailure = () => {
    dispatch({ type: 'FETCH_ORDERS_FAILURE_RESET' });
  };

  const NoResultsFoundMessage = () => (
    <div className="wr-message-image mt-5">
      <div className="wr-image">
        <img src={NoResultFoundIcon} alt="Order-History-Empty-Icon" className="message-img" />
      </div>
      <label className="wr-text-bold mt-3">No results found!</label>
      <label className="wr-text-light mt-1">
        We cannot find the information you are searching for. <br />
        Please make sure the input information is correct!
      </label>
    </div>
  );

  const NoDataExistsMessage = () => (
    <div className="wr-message-image mt-5">
      <div className="wr-image">
        <img src={OrderHistoryEmptyIcon} alt="Order-History-Empty-Icon" className="message-img" />
      </div>
      <label className="wr-text-bold mt-3">Your eCertificate Order History is Empty</label>
      <label className="wr-text-light mt-1">Looks like you haven’t bought any eCertificates yet</label>
    </div>
  );

  const handleOnSelectOrderStatus = (eventKey, event) => {
    setOrderStatus(eventKey);
  };

  return (
    <div className="container-fluid order-histroty px-0">
      <div className="order-history-wrapper">
        <div className="logo">
          <img src={darkLogo} alt="dark-logo" className="logo-img" style={{ width: 123 }} />
          <Button className="btn back-btn" variant="link">
            <img src={BackBtn} alt="back-btn" />
          </Button>
        </div>
        <div className="orderh-histroy-btn-wrapper">
          <Button onClick={handleBuyECertificateBtnClick} className="order-back-btn">
            Buy eCertificates
          </Button>
          <AuthenticatedTemplate>
            <div className="home-nav-wrapper">
              <button onClick={goToMyProfile} className="btn-outline icon-left-btn">
                My Profile
              </button>
            </div>
          </AuthenticatedTemplate>
        </div>
      </div>

      <div className="wr-order-histroy pt-5 mt-5">
        <div className="wr-search">
          <h1 className="order-history-title pt-3">eCertificate Order History</h1>
          <div className="order-history-button">
            <input
              type="text"
              placeholder="Search by order number"
              className="order-histroy-search mt-3 mb-1 me-3"
              onChange={handleOnChangeSearch}
            />
            <Dropdown onSelect={handleOnSelectOrderStatus}>
              <DropdownButton
                id="order-status-dropdown-button"
                className="order-status-dropdown-button"
                title={
                  <>
                    <div className="dropdown-text">{orderStatus}</div>
                    <div className="dropdown-icon-sdie">
                      <div className="dropdown-vr-line"></div>
                      <img src={CheveronDown} alt="cheveron" className="dropdown-cheveron" />
                    </div>
                  </>
                }
              >
                <Dropdown.Item eventKey={purchasedECertificateOrderStatus.ALL}>All</Dropdown.Item>
                <Dropdown.Item eventKey={purchasedECertificateOrderStatus.COMPLETED}>Completed</Dropdown.Item>
                <Dropdown.Item eventKey={purchasedECertificateOrderStatus.PENDING}>Pending</Dropdown.Item>
              </DropdownButton>
            </Dropdown>
          </div>
        </div>

        <div className="wr-order-history-card mt-3">
          <div className="main-card-container">
            {orderHistoryState.data.map((certificate) => (
              <OrderCard
                orderNumber={certificate?.orderNumber}
                price={certificate?.price}
                referenceInstrument={certificate?.referenceInstrument}
                isCompleted={certificate?.orderStatus === 'Completed' ? true : false}
                quantity={convertUnits(certificate?.gramsQuantity, 'g')}
              />
            ))}
            <div style={{ border: '15px solid transparent' }} ref={ref}></div>{' '}
          </div>
          {orderHistoryState.isLoading && (
            <div className="spinner-loader-wrapper">
              <Spinner animation="border" role="status">
                {' '}
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}
          {orderHistoryState.error && <div>Error: {orderHistoryState.error}</div>}
          {!orderHistoryState.hasMore && orderHistoryState.data.length !== 0 && (
            <div className="list-end-message">You’ve reached the end of the list</div>
          )}
          {orderHistoryState.data.length === 0 &&
            orderNumber === '' &&
            orderStatus === purchasedECertificateOrderStatus.ALL && <NoDataExistsMessage />}
          {orderHistoryState.data.length === 0 &&
            ((orderNumber !== '' && orderStatus !== purchasedECertificateOrderStatus.ALL) ||
              (orderNumber !== '' && orderStatus === purchasedECertificateOrderStatus.ALL) ||
              (orderNumber === '' && orderStatus !== purchasedECertificateOrderStatus.ALL)) && (
              <NoResultsFoundMessage />
            )}
        </div>
      </div>
    </div>
  );
};
export default OrderHistory;
/**
 * call the API to get the order history of the guest user(As od now it is an open API endpoint)
 * If the email does not exist -> placeholder
 * If the email exists but no order history -> placeholder (ok)
 * If the email exists and has order history -> display the order history (ok)
 * If no search results exists there should be a proper placeholder (0k)
 * card actions:
 * allow resend E-certificate (ok)
 */

export const OrderHistoryAuthenticatedWrapper = () => {
  const { instance } = useMsal();
  if (instance.getActiveAccount()?.idTokenClaims.email) {
    return (
      <div className="verify-guest">
        {' '}
        <OrderHistory userEmail={instance.getActiveAccount()?.idTokenClaims.email} />
      </div>
    );
  } else {
    return <Navigate to="/" replace={true} />;
  }
};
