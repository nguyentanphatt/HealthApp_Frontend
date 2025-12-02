import en from "@/locales/en.json";
import vi from "@/locales/vi.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  vi: { translation: vi },
  en: { translation: en },
}

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  lng: "vi",
  fallbackLng: "vi",
  interpolation: { escapeValue: false },
  resources
})

const STORAGE_KEY = "language";

async function bootstrapLanguage() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "vi") {
      await i18n.changeLanguage(stored);
    }
  } catch (_e) {
  }
}

bootstrapLanguage();

export default i18n;