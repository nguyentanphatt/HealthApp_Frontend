import { updateUserSetting } from "@/services/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type Units = {
  height: "cm" | "ft";
  weight: "kg" | "g";
  water: "ml" | "fl oz";
  temperature: "C" | "F";
  language: "vi" | "en";
};

const defaultUnits: Units = {
  height: "cm",
  weight: "kg",
  water: "ml",
  temperature: "C",
  language: "vi",
};

type UnitContextType = {
  units: Units;
  setUnit: <K extends keyof Units>(key: K, value: Units[K]) => void;
  isLoaded: boolean;
};

const UnitContext = createContext<UnitContextType>({
  units: defaultUnits,
  setUnit: () => {},
  isLoaded: false,
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
    updateUnitsToAPI(newUnits);
  };

  const saveUnitsToStorage = async (unitsToSave: Units) => {
    try {
      await AsyncStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(unitsToSave));
    } catch (error) {
      console.error('Error saving units to storage:', error);
    }
  };

  const updateUnitsToAPI = async (unitsToSave: Units) => {
    try {
      await updateUserSetting({
        height: unitsToSave.height,
        weight: unitsToSave.weight,
        water: unitsToSave.water,
        temp: unitsToSave.temperature,
        lang: unitsToSave.language
      });
    } catch (error) {
      console.error('Error updating units to API:', error);
    }
  };

  return (
    <UnitContext.Provider value={{ units, setUnit, isLoaded }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnits = () => useContext(UnitContext);
