import React, { createContext, useContext, useState } from "react";

type Units = {
  height: "cm" | "ft";
  weight: "kg" | "g";
  water: "ml" | "fl oz";
  temperature: "C" | "F";
};

const defaultUnits: Units = {
  height: "cm",
  weight: "kg",
  water: "ml",
  temperature: "C",
};

type UnitContextType = {
  units: Units;
  setUnit: <K extends keyof Units>(key: K, value: Units[K]) => void;
};

const UnitContext = createContext<UnitContextType>({
  units: defaultUnits,
  setUnit: () => {},
});

export const UnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [units, setUnits] = useState<Units>(defaultUnits);

  const setUnit = <K extends keyof Units>(key: K, value: Units[K]) => {
    setUnits((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <UnitContext.Provider value={{ units, setUnit }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnits = () => useContext(UnitContext);
