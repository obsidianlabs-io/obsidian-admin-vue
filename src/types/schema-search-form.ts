export type SchemaSearchFieldType = 'input' | 'select';

export interface SchemaSearchField<Model extends Record<string, any> = Record<string, any>> {
  key: keyof Model & string;
  type: SchemaSearchFieldType;
  label: string;
  placeholder?: string;
  span?: string;
  clearable?: boolean;
  filterable?: boolean;
  options?: CommonType.Option<any>[];
}
