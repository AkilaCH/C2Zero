import React from 'react';
import { Modal } from 'react-bootstrap';
import closeIcon from '../../assets/images/close.svg';
import { FacebookShareButton, TwitterShareButton } from 'react-share';
import facebookIcon from '../../assets/images/facebook.svg';
import twitterIcon from '../../assets/images/twitter.svg';
import logo_dark from '../../assets/images/logo_black.svg';
import { appProperties } from '../../util/appProperties';
import { convertUnits, calculateTotal } from '../../common/formatter';

const TransactionModal = (props) => {
  const tonnes = props.quantity.tonne ? props.quantity.tonne : 0;
  const kiloGram = props.quantity.kilogram ? props.quantity.kilogram : 0;
  const gram = props.quantity.gram ? props.quantity.gram : 0;
  const normalizedQty = calculateTotal(tonnes, kiloGram, gram);

  let text =
    "I've eliminated a total of " +
    (normalizedQty ? normalizedQty : '') +
    " of CO2e emissions... But I'm not just posting about this to brag (okay, maybe a little). I need your help. Join me in the fight against big polluters, and let's take the world #BeyondNeutral";
  if (props.isSingleTx && props.singleTx) {
    text =
      'This ' +
      (props.singleTx.productDisplayName ? props.singleTx.productDisplayName : '') +
      ' from ' +
      props.singleTx.vendorDisplayName +
      ' helped me lock away ' +
      (normalizedQty ? normalizedQty : '') +
      ' of CO2e emissions. How good is that! if you want to go #BeyondNeutral too and stop big polluters from polluting check out all the products with C2Zero attached.';
  }

  const unitsConvertedValue = props.isSingleTx
    ? convertUnits(props.singleTx.quantity, props.singleTx.quantityUnit)
    : '';
  const splitUnitsConvertedValues = unitsConvertedValue ? unitsConvertedValue.toString().split(' ') : '';

  const getRandomSocialShareTemplate = () => {
    const templateIndex = Math.floor(Math.random() * 4) + 1;
    return `${appProperties.appHost}/social_media_share_template_${templateIndex}.html`;
  };

  const shareUrl = getRandomSocialShareTemplate();

  return (
    <div>
      <Modal
        show={props.showModal}
        onHide={props.closeModal}
        animation={true}
        dialogClassName={props.isSingleTx ? 'share-modal share-individual' : 'share-modal'}
      >
        <Modal.Body>
          {props.isSingleTx ? (
            <div>
              <button className="modal-close-btn" onClick={props.closeModal}>
                <img src={closeIcon} alt="close icon" />
              </button>

              <img className="logo" src={props.singleTx.vendorLogoUrl} alt="logo" />
              <div className="dashboard-info">
                <h1>
                  {splitUnitsConvertedValues ? splitUnitsConvertedValues[0] : ''}
                  <span>{splitUnitsConvertedValues ? splitUnitsConvertedValues[1] : ''}</span>
                </h1>
                <h2>of CO2e eliminated</h2>
                <div className="data">
                  <div className="data-item">
                    <span className="item-name">Date</span>
                    <span>{props.singleTx.createdDate ? props.singleTx.createdDate : ''}</span>
                  </div>
                  <div className="data-item">
                    <span className="item-name">Item</span>
                    <span>{props.singleTx.productDisplayName ? props.singleTx.productDisplayName : ''}</span>
                  </div>
                  <div className="data-item">
                    <span className="item-name">Vendor</span>
                    <span>{props.singleTx.vendorDisplayName ? props.singleTx.vendorDisplayName : ''}</span>
                  </div>
                  <div className="data-item">
                    <span className="item-name">CO2</span>
                    <span>{unitsConvertedValue}</span>
                  </div>
                </div>
              </div>
              <div className="share-btns">
                <h3>Share this on</h3>
                <div className="share-btn-wrapper">
                  <FacebookShareButton
                    className="p-2 facebook-btn"
                    url={shareUrl}
                    quote={text}
                    hashtag="#BeyondNeutral"
                    appid="557596488616863"
                  >
                    <img src={facebookIcon} alt="facebook icon" />
                  </FacebookShareButton>
                  <TwitterShareButton className="p-2 twitter-btn" url={shareUrl} hashtag="#BeyondNeutral" title={text}>
                    <img src={twitterIcon} alt="twitter icon" />
                  </TwitterShareButton>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <button className="modal-close-btn" onClick={props.closeModal}>
                <img src={closeIcon} alt="close icon" />
              </button>

              <img className="logo" src={logo_dark} alt="logo" />
              <div className="dashboard-info">
                <h2>Total CO2e Eliminated</h2>
                <div className="data">
                  <h3>
                    {tonnes ? tonnes : '0'}
                    <span>tonnes</span>
                  </h3>
                  <h3>
                    {kiloGram ? kiloGram : '0'}
                    <span>kilograms</span>
                  </h3>
                  <h3>
                    {gram ? gram : '0'}
                    <span>grams</span>
                  </h3>
                </div>
              </div>
              <div className="share-btns">
                <h3>Share this on</h3>
                <div className="share-btn-wrapper">
                  <FacebookShareButton
                    className="p-2 facebook-btn"
                    url={shareUrl}
                    quote={text}
                    hashtag="#BeyondNeutral"
                    appid="557596488616863"
                  >
                    <img src={facebookIcon} alt="facebook icon" />
                  </FacebookShareButton>
                  <TwitterShareButton className="p-2 twitter-btn" url={shareUrl} hashtag="#BeyondNeutral" title={text}>
                    <img src={twitterIcon} alt="twitter icon" />
                  </TwitterShareButton>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TransactionModal;
