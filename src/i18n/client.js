import i18n from 'i18next'

import BrowserLanguageDetector from 'i18next-browser-languagedetector'

import { initReactI18next } from 'react-i18next'

import en_US from './locates/en-US/translation.json'
import vi_VN from './locates/vi-VN/translation.json'

const resources = {
  'en-US': en_US,
  'vi-VN': vi_VN
}

const options = {
  resources,
  fallbackLng: 'en-US',
  debug: true,

  interpolation: {
    escapeValue: false
  }
}

i18n
  .use(BrowserLanguageDetector)
  .use(initReactI18next)
  .init(options)

export default i18n
