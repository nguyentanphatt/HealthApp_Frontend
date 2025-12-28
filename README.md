## HealthApp – Frontend

HealthApp is a personal health tracking application (activity, water, sleep, nutrition, etc.) built with Expo + React Native.

---

## Main Features

- **Health overview**
  - Dashboard showing steps, distance, calories, sleep, water intake, and recent activities.

- **Activity tracking**
  - Real-time GPS tracking: distance, current / average / max speed.
  - Step counting using Accelerometer, estimating movement intensity (MV) and calories burned.
  - Save and view activity history, with a detailed session screen.

- **Water management**
  - Set and edit daily water intake goals.
  - Receive water intake reminders.

- **Sleep tracking**
  - Record sleep duration and view basic statistics.

- **Nutrition tracking**
  - List and view food details.
  - Add new foods (upload).

- **Health news & articles**
  - List of articles, view details, create new articles.

- **Account & user settings**
  - Sign up, sign in, forgot password, verify account.
  - Update profile, change password.
  - Configure measurement units (kg/lb, cm/inch, etc.), language, policy, and measurement settings.

---

## Tech Stack

- **React Native** + **Expo Router** (file-based routing).
- **TypeScript**.
- **Expo SDK**:
  - `expo-location` – GPS tracking.
  - `expo-sensors` (Accelerometer) – step counting and movement intensity.
  - `expo-notifications` (via helpers/services) – reminders and tracking status.
- **React Native Maps** – display map and activity routes.
- **AsyncStorage** – local persistence (tracking session, pause state, etc.).
- **State management**: Zustand (`stores/useAuthStore`, `useUserStore`, `useToast`, `useModalStore`, …).
- **i18n / multi-language**: JSON locale files under `locales/` (e.g. `en.json`).

---

## Project Structure

- `app/`
  - `(tabs)/` – main tab screens.
  - `activity/` – activity tracking, history, statistics.
  - `auth/` – sign in, sign up, forgot password, verify.
  - `food/`, `sleep/`, `water/`, `work/`, `news/`, `user/setting/` – feature modules.
- `components/`
  - Reusable UI like `ActivityCard`, `ReminderList`, `LockScreen`, etc.
- `hooks/`
  - `useActivityTracking.ts` – centralized activity tracking logic (GPS, steps, sync, countdown, …).
  - `useUnits.ts`, `useNotification.ts` – utility hooks.
- `context/`
  - `appThemeContext.tsx`, `unitContext.tsx` – theme and unit settings.
- `stores/`
  - Zustand stores for auth, user, toast, modal, etc.
- `utils/`
  - `activityHelper.ts` – activity calculations (distance, speed, time, calories, …).
  - `activityNotificationService.ts`, `notificationsHelper.ts` – notification helpers.
  - `convertTime.ts`, `convertMeasure.ts`, `validate.ts` – shared utilities.

---

## Setup & Run

1. **Install dependencies**

**Description:**  
A wellness mobile application that helps users track their daily habits including water intake, running activity, sleep quality, and nutrition.

2. **Start the app (dev)**

---

   You can then open the app via:

   - Expo Go on a physical device.
   - Android Emulator / iOS Simulator.
   - A development build (if configured).

---

## Useful Scripts

Common scripts (may vary depending on `package.json`):

- `npm start` / `expo start`: start the dev server.
- `npm run android`: run on Android emulator/device.
- `npm run ios`: run on iOS simulator (macOS).
- `npm run web`: run on web (if supported).
- `npm run lint`: run linter (if configured).

---
## Document
- [Figma](https://www.figma.com/design/ZaRVF6WRn12aYFgCpMooQ5/HealthCare?node-id=0-1&t=DT3ILbTUToV0jg3K-1)

---

## Learn More

- Expo → https://docs.expo.dev  
- Zustand → https://docs.pmnd.rs/zustand  
- TanStack Query → https://tanstack.com/query  
- i18n → https://react.i18next.com  

