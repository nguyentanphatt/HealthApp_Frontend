import { getUserSetting, updateUserSetting } from "@/services/user";
import { useAuthStore } from "@/stores/useAuthStore";
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
  loadFromAPI: () => Promise<void>;
};

const UnitContext = createContext<UnitContextType>({
  units: defaultUnits,
  setUnit: () => {},
  isLoaded: false,
  loadFromAPI: async () => {},
});

const UNITS_STORAGE_KEY = '@health_app_units';

export const UnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [units, setUnits] = useState<Units>(defaultUnits);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load units from API first, then fallback to AsyncStorage
  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      // Only try to load from API if user is authenticated
      const accessToken = useAuthStore.getState().accessToken;
      if (accessToken) {
        try {
          const userSettings = await getUserSetting();
          if (userSettings) {
            const apiUnits: Units = {
              height: (userSettings.height as "cm" | "ft") || defaultUnits.height,
              weight: (userSettings.weight as "kg" | "g") || defaultUnits.weight,
              water: (userSettings.water as "ml" | "fl oz") || defaultUnits.water,
              temperature: (userSettings.temp as "C" | "F") || defaultUnits.temperature,
              language: (userSettings.language as "vi" | "en") || defaultUnits.language,
            };
            setUnits(apiUnits);
            // Save to AsyncStorage for offline support
            await AsyncStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(apiUnits));
            setIsLoaded(true);
            return;
          }
        } catch (error) {
          // If API fails, fallback to AsyncStorage
          console.error('Error loading units from API:', error);
        }
      }
      // Fallback to AsyncStorage if not authenticated or API fails
      await loadUnitsFromStorage();
    } catch (error) {
      console.error('Error loading units:', error);
      await loadUnitsFromStorage();
    } finally {
      setIsLoaded(true);
    }
  };

  const loadUnitsFromStorage = async () => {
    try {
      const storedUnits = await AsyncStorage.getItem(UNITS_STORAGE_KEY);
      if (storedUnits) {
        const parsedUnits = JSON.parse(storedUnits);
        setUnits(parsedUnits);
      }
    } catch (error) {
      console.error('Error loading units from storage:', error);
    }
  };

  const loadFromAPI = async () => {
    try {
      const accessToken = useAuthStore.getState().accessToken;
      if (!accessToken) {
        console.warn('Cannot load units from API: No access token');
        return;
      }
      const userSettings = await getUserSetting();
      if (userSettings) {
        const apiUnits: Units = {
          height: (userSettings.height as "cm" | "ft") || defaultUnits.height,
          weight: (userSettings.weight as "kg" | "g") || defaultUnits.weight,
          water: (userSettings.water as "ml" | "fl oz") || defaultUnits.water,
          temperature: (userSettings.temp as "C" | "F") || defaultUnits.temperature,
          language: (userSettings.language as "vi" | "en") || defaultUnits.language,
        };
        setUnits(apiUnits);
        await AsyncStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(apiUnits));
      }
    } catch (error) {
      console.error('Error loading units from API:', error);
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
    <UnitContext.Provider value={{ units, setUnit, isLoaded, loadFromAPI }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnits = () => useContext(UnitContext);
