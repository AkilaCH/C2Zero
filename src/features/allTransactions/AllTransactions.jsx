import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { appProperties } from '../../util/appProperties';
import { getAllTransactionsService } from '../../services/claimService';
import arrowIcon from '../../assets/images/arrow.svg';
import TransactionItem from './TransactionItem';
import TransactionModal from '../allTransactions/TransactionModal';
import { useNavigate } from 'react-router';
import Skeleton from 'react-loading-skeleton';
import { formatDate } from '../../common/formatter';
import { toast } from 'react-toastify';

export const AllTransactions = (props) => {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const accounts = instance.getAllAccounts();
  const [transactions, setTransactions] = useState(null);
  const [showTXModal, setShowTXModal] = useState(false);
  const [txQty, setTxQty] = useState(0);
  const [isGetAllTransactionsApiInProgress, setGetAllTransactionsnApiInProgress] = useState(true);
  const [isSingleTx, setIsSingleTx] = useState(false);
  const [singleTx, setSingleTx] = useState({
    vendorDisplayName: '',
    productDisplayName: '',
    createdDate: '',
    quantity: '',
    quantityUnit: '',
    vendorLogoUrl: ''
  });
  const [err, setError] = useState(null);
  const pageNumber = null;
  const pageSize = null;

  const handleTXModalShow = () => {
    setIsSingleTx(true);
    setShowTXModal(true);
  };
  const handleTXModalClose = () => {
    setShowTXModal(false);
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    const getAllTransactions = async () => {
      setGetAllTransactionsnApiInProgress(true);
      if (!accounts[0].idTokenClaims.newUser) {
        try {
          const resp = await getAllTransactionsService(instance, appProperties.apiHost, pageNumber, pageSize);
          setTransactions(resp ? resp.userTransactions : null);
        } catch (error) {
          setError(error);
        } finally {
          setGetAllTransactionsnApiInProgress(false);
          setTimeout(() => {
            setError(null);
          }, 5000);
        }
      }
    };

    if (!transactions) {
      getAllTransactions();
    }
  }, [accounts, instance, transactions]);

  useEffect(() => {
    if (err && err?.title)
      toast.error(err.title, {
        onClose: () => setError(null)
      });
  }, [err]);

  return (
    <div>
      <div>
        <div className="container small-container">
          <div className="c2zero-navbar">
            <span onClick={navigateToDashboard}>
              <img src={arrowIcon} alt="arrow icon" />
            </span>
            <h1>All Transactions</h1>
          </div>
          <div className="row">
            <div className="col-sm-12 p-0">
              {isGetAllTransactionsApiInProgress ? (
                <React.Fragment>
                  <Skeleton duration={2} height={83} />
                  <Skeleton duration={2} height={83} />
                  <Skeleton duration={2} height={83} />
                  <Skeleton duration={2} height={83} />
                  <Skeleton duration={2} height={83} />
                </React.Fragment>
              ) : (
                <div className="transaction-item-wrapper">
                  {transactions.map((t) => (
                    <TransactionItem
                      key={t.id}
                      image={t.vendorLogoUrl}
                      date={formatDate(t.createdOn)}
                      name={t.vendorDisplayName}
                      type={t.productDisplayName}
                      weight={t.quantity}
                      unit={t.quantityUnit}
                      normalizedQty={t.quantityNormalizedValue}
                      handleShow={handleTXModalShow}
                      setQty={setTxQty}
                      setSingleTx={setSingleTx}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {showTXModal && (
          <TransactionModal
            closeModal={handleTXModalClose}
            showModal={showTXModal}
            quantity={txQty}
            isSingleTx={isSingleTx}
            singleTx={singleTx}
          />
        )}
      </div>
    </div>
  );
};

export default AllTransactions;
