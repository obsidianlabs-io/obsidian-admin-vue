import systemSectionZhCN from './langs/modules/zh-cn/system';
import commonSectionZhCN from './langs/modules/zh-cn/common';
import requestSectionZhCN from './langs/modules/zh-cn/request';
import themeSectionZhCN from './langs/modules/zh-cn/theme';
import routeSectionZhCN from './langs/modules/zh-cn/route';
import menuSectionZhCN from './langs/modules/zh-cn/menu';
import formSectionZhCN from './langs/modules/zh-cn/form';
import dropdownSectionZhCN from './langs/modules/zh-cn/dropdown';
import iconSectionZhCN from './langs/modules/zh-cn/icon';
import datatableSectionZhCN from './langs/modules/zh-cn/datatable';
import pageLoginSectionZhCN from './langs/modules/zh-cn/page-login';
import systemSectionEnUS from './langs/modules/en-us/system';
import commonSectionEnUS from './langs/modules/en-us/common';
import requestSectionEnUS from './langs/modules/en-us/request';
import themeSectionEnUS from './langs/modules/en-us/theme';
import routeSectionEnUS from './langs/modules/en-us/route';
import menuSectionEnUS from './langs/modules/en-us/menu';
import formSectionEnUS from './langs/modules/en-us/form';
import dropdownSectionEnUS from './langs/modules/en-us/dropdown';
import iconSectionEnUS from './langs/modules/en-us/icon';
import datatableSectionEnUS from './langs/modules/en-us/datatable';
import pageLoginSectionEnUS from './langs/modules/en-us/page-login';

const guestLocales: Record<App.I18n.LangType, App.I18n.Schema> = {
  'zh-CN': {
    system: systemSectionZhCN,
    common: commonSectionZhCN,
    request: requestSectionZhCN,
    theme: themeSectionZhCN,
    route: routeSectionZhCN,
    menu: menuSectionZhCN,
    form: formSectionZhCN,
    dropdown: dropdownSectionZhCN,
    icon: iconSectionZhCN,
    datatable: datatableSectionZhCN,
    page: { login: pageLoginSectionZhCN } as App.I18n.Schema['page']
  },
  'en-US': {
    system: systemSectionEnUS,
    common: commonSectionEnUS,
    request: requestSectionEnUS,
    theme: themeSectionEnUS,
    route: routeSectionEnUS,
    menu: menuSectionEnUS,
    form: formSectionEnUS,
    dropdown: dropdownSectionEnUS,
    icon: iconSectionEnUS,
    datatable: datatableSectionEnUS,
    page: { login: pageLoginSectionEnUS } as App.I18n.Schema['page']
  }
};

export default guestLocales;
