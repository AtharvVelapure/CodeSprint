import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";

const localeFiles = import.meta.glob(
    "./locales/*.json",
    {
        eager: true
    }
);


// =========================================================
// BUILD RESOURCES
// =========================================================

const resources = {};

Object.entries(localeFiles).forEach(
    ([filePath, module]) => {

        const fileName = filePath
            .split("/")
            .pop()
            .replace(".json", "");

        resources[fileName] = {
            translation: module.default || module
        };
    }
);


// =========================================================
// MAKE SURE ENGLISH EXISTS
// =========================================================

if (!resources.en) {
    resources.en = {
        translation: en
    };
}


// =========================================================
// INITIALIZE I18NEXT
// =========================================================

i18n
    .use(initReactI18next)
    .init({
        resources,

        lng: "en",

        fallbackLng: "en",

        interpolation: {
            escapeValue: false
        },

        react: {
            useSuspense: false
        }
    });

export default i18n;