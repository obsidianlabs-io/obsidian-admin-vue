import systemSection from './modules/en-us/system';
import commonSection from './modules/en-us/common';
import requestSection from './modules/en-us/request';
import themeSection from './modules/en-us/theme';
import routeSection from './modules/en-us/route';
import menuSection from './modules/en-us/menu';
import pageSection from './modules/en-us/page';
import formSection from './modules/en-us/form';
import dropdownSection from './modules/en-us/dropdown';
import iconSection from './modules/en-us/icon';
import datatableSection from './modules/en-us/datatable';

const local: App.I18n.Schema = {
  system: systemSection,
  common: commonSection,
  request: requestSection,
  theme: themeSection,
  route: routeSection,
  menu: menuSection,
  page: pageSection,
  form: formSection,
  dropdown: dropdownSection,
  icon: iconSection,
  datatable: datatableSection
};

export default local;
