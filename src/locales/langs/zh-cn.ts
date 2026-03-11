import systemSection from './modules/zh-cn/system';
import commonSection from './modules/zh-cn/common';
import requestSection from './modules/zh-cn/request';
import themeSection from './modules/zh-cn/theme';
import routeSection from './modules/zh-cn/route';
import menuSection from './modules/zh-cn/menu';
import pageSection from './modules/zh-cn/page';
import pageLoginSection from './modules/zh-cn/page-login';
import formSection from './modules/zh-cn/form';
import dropdownSection from './modules/zh-cn/dropdown';
import iconSection from './modules/zh-cn/icon';
import datatableSection from './modules/zh-cn/datatable';

const local: App.I18n.Schema = {
  system: systemSection,
  common: commonSection,
  request: requestSection,
  theme: themeSection,
  route: routeSection,
  menu: menuSection,
  page: {
    login: pageLoginSection,
    ...pageSection
  },
  form: formSection,
  dropdown: dropdownSection,
  icon: iconSection,
  datatable: datatableSection
};

export default local;
