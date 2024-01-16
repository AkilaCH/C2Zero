import React from 'react';
import shareIcon from '../../assets/images/share.svg';
import { convertUnits } from '../../common/formatter';

const TransactionItem = (props) => {
  const openModal = () => {
    props.setQty(props.normalizedQty);
    props.setSingleTx({
      vendorDisplayName: props.name,
      productDisplayName: props.type,
      createdDate: props.date,
      quantity: props.weight,
      quantityUnit: props.unit,
      vendorLogoUrl: props.image
    });
    props.handleShow();
  };

  return (
    <div
      className={props.index !== null && props.index === 0 ? 'transaction-item selected' : 'transaction-item'}
      onClick={openModal}
    >
      <div className="item-image">
        <img src={props.image} alt="" />
      </div>

      <div className="details">
        <span className="date">{props.date}</span>
        <span className="name">{props.name}</span>
        <span className="type">{props.type}</span>
      </div>
      <span className="weight">{convertUnits(props.weight, props.unit)}</span>
      <img src={shareIcon} alt="share icon" className="share-icon" />
    </div>
  );
};

export default TransactionItem;
