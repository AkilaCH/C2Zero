import React from 'react';
import closeIcon from '../assets/images/close.svg';

const NotificationToast = (props) => {
  return (
    <div
      className={
        props.toastType === 'success'
          ? `${`floating-msg ${props.toastType} show`}`
          : `floating-msg ${props.toastType} show`
      }
    >
      <h1>{props.message}</h1>
      <span onClick={props.callBack && props.callBack}>
        <img src={closeIcon} alt="close-icon" />
      </span>
    </div>
  );
};

export default NotificationToast;
