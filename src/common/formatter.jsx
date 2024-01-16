import moment from 'moment';
const unitsConversion = require('convert-units');

export const convertUnits = (quantity, unit) => {
  if (quantity && unit) {
    const converted = unitsConversion(quantity).from(unit).toBest();
    return `${parseFloat(converted.val.toFixed(2))} ${converted.unit === 'mt' ? 't' : converted.unit}`;
  }
};
export const calculateTotal = (tonnes, kiloGram, gram) => {
  let convertedKg = 0;
  let convertedG = 0;
  if (kiloGram > 0) {
    convertedKg = unitsConversion(kiloGram).from('kg').to('mt');
  }
  if (gram > 0) {
    convertedG = unitsConversion(gram).from('g').to('mt');
  }
  const convertedTotal = tonnes + convertedKg + convertedG;
  const bestUnit = unitsConversion(convertedTotal).from('mt').toBest();
  return `${parseFloat(bestUnit.val.toFixed(4))} ${bestUnit.unit === 'mt' ? 't' : bestUnit.unit}`;
};

export const formatDate = (date) => {
  return date ? moment.utc(date.toString()).local().format('DD MMM, yyyy') : '-';
};
