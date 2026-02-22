import { locale } from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import { resolvePreferredLocale } from './default-locale';

/**
 * Set dayjs locale
 *
 * @param lang
 */
export function setDayjsLocale(lang?: App.I18n.LangType) {
  const localMap = {
    'zh-CN': 'zh-cn',
    'en-US': 'en'
  } satisfies Record<App.I18n.LangType, string>;

  const l = lang || resolvePreferredLocale();

  locale(localMap[l]);
}
