import { useUnits as useUnitsContext } from '@/context/unitContext';
import { convertHeight, convertTemperature, convertWater, convertWeight, toBaseHeight, toBaseTemperature, toBaseWater, toBaseWeight } from '@/utils/convertMeasure';

export const useUnits = () => {
  const { units, setUnit } = useUnitsContext();

  const displayHeight = (valueCm: number) => {
    const converted = convertHeight(valueCm, units.height);
    return {
      value: converted,
      unit: units.height,
      formatted: `${Math.round(converted * 10) / 10} ${units.height}`
    };
  };

  const displayWeight = (valueKg: number) => {
    const converted = convertWeight(valueKg, units.weight);
    return {
      value: converted,
      unit: units.weight,
      formatted: `${Math.round(converted * 10) / 10} ${units.weight}`
    };
  };

  const displayWater = (valueMl: number) => {
    const converted = convertWater(valueMl, units.water);
    return {
      value: converted,
      unit: units.water,
      formatted: `${Math.round(converted)} ${units.water}`
    };
  };

  const displayTemperature = (valueC: number) => {
    const converted = convertTemperature(valueC, units.temperature);
    return {
      value: converted,
      unit: units.temperature,
      formatted: `${Math.round(converted)}°${units.temperature}`
    };
  };

  const inputToBaseHeight = (value: number) => toBaseHeight(value, units.height);
  const inputToBaseWeight = (value: number) => toBaseWeight(value, units.weight);
  const inputToBaseWater = (value: number) => toBaseWater(value, units.water);
  const inputToBaseTemperature = (value: number) => toBaseTemperature(value, units.temperature);

  return {
    units,
    setUnit,
    displayHeight,
    displayWeight,
    displayWater,
    displayTemperature,
    inputToBaseHeight,
    inputToBaseWeight,
    inputToBaseWater,
    inputToBaseTemperature,
  };
};
