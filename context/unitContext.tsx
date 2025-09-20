import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

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

const UNITS_STORAGE_KEY = '@health_app_units';

export const UnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [units, setUnits] = useState<Units>(defaultUnits);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load units from AsyncStorage on mount
  useEffect(() => {
    loadUnitsFromStorage();
  }, []);

  const loadUnitsFromStorage = async () => {
    try {
      const storedUnits = await AsyncStorage.getItem(UNITS_STORAGE_KEY);
      if (storedUnits) {
        const parsedUnits = JSON.parse(storedUnits);
        setUnits(parsedUnits);
      }
    } catch (error) {
      console.error('Error loading units from storage:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setUnit = <K extends keyof Units>(key: K, value: Units[K]) => {
    const newUnits = { ...units, [key]: value };
    setUnits(newUnits);
    saveUnitsToStorage(newUnits);
  };

  const saveUnitsToStorage = async (unitsToSave: Units) => {
    try {
      await AsyncStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(unitsToSave));
    } catch (error) {
      console.error('Error saving units to storage:', error);
    }
  };

  // Don't render until units are loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <UnitContext.Provider value={{ units, setUnit }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnits = () => useContext(UnitContext);
