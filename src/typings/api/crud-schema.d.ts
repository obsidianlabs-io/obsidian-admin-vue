declare namespace Api {
  namespace CrudSchema {
    type SearchFieldType = 'input' | 'select';

    type ColumnType = 'index' | 'text' | 'status' | 'datetime';

    interface SearchField {
      key: string;
      type: SearchFieldType;
      labelKey: App.I18n.I18nKey;
      placeholderKey?: App.I18n.I18nKey;
      clearable?: boolean;
      filterable?: boolean;
      optionSource?: 'role.all' | 'status.enable' | string;
    }

    interface Column {
      key: string;
      type: ColumnType;
      titleKey: App.I18n.I18nKey;
      align: NaiveUI.TableAlign;
      width?: number;
      minWidth?: number;
      emptyLabelKey?: App.I18n.I18nKey;
    }

    interface Schema {
      resource: string;
      permission: string;
      searchFields: SearchField[];
      columns: Column[];
      scrollX: number;
    }
  }
}
