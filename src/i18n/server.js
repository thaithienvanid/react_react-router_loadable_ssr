import i18n from 'i18next'

import { LanguageDetector as ExpressLanguageDetector } from 'i18next-express-middleware'

import en_US from './locates/en-US/translation.json'
import vi_VN from './locates/vi-VN/translation.json'

const resources = {
  'en-US': en_US,
  'vi-VN': vi_VN
}

i18n.use(ExpressLanguageDetector).init({
  resources,
  fallbackLng: 'en-US',
  debug: false,

  interpolation: {
    escapeValue: false
  }
})

export default i18n
