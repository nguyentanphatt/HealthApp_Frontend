export function convertHeight(valueCm: number, unit: "cm" | "ft") {
  if (unit === "cm") return valueCm;
  return valueCm / 30.48;
}

export function convertWeight(valueKg: number, unit: "kg" | "g") {
  if (unit === "kg") return valueKg;
  return valueKg * 1000; 
}

export function convertWater(valueMl: number, unit: "ml" | "fl oz") {
  if (unit === "ml") return Math.round(valueMl);
  return Math.round(valueMl * 0.033814);
}

export function convertTemperature(valueC: number, unit: "C" | "F") {
  if (unit === "C") return valueC;
  return (valueC * 9) / 5 + 32;
}

export function toBaseHeight(value: number, unit: "cm" | "ft") {
  return unit === "cm" ? value : value * 30.48;
}

export function toBaseWeight(value: number, unit: "kg" | "g") {
  return unit === "kg" ? value : value / 1000;
}

export function toBaseWater(value: number, unit: "ml" | "fl oz") {
  if (unit === "ml") return Math.round(value);
  return Math.round(value * 29.5735);
}

export function toBaseTemperature(value: number, unit: "C" | "F") {
  return unit === "C" ? value : ((value - 32) * 5) / 9;
}
