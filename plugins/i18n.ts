import en from "@/locales/en.json";
import vi from "@/locales/vi.json";
import { getUserSetting } from "@/services/user";
import { useAuthStore } from "@/stores/useAuthStore";
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
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      try {
        const userSettings = await getUserSetting();
        if (userSettings) {
          const language = ((userSettings as any).lang || userSettings.language) as "vi" | "en" | undefined;
          if (language === "vi" || language === "en") {
            await i18n.changeLanguage(language);
            await AsyncStorage.setItem(STORAGE_KEY, language);
            return;
          }
        }
      } catch (error) {
        console.error('Error loading language from API:', error);
      }
    }
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "vi") {
      await i18n.changeLanguage(stored);
    }
  } catch (_e) {
  }
}

bootstrapLanguage();

export default i18n;