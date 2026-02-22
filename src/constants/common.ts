import { transformRecordToOption } from '@/utils/common';
import { $t } from '@/locales';

export const yesOrNoRecord: Record<CommonType.YesOrNo, App.I18n.I18nKey> = {
  Y: 'common.yesOrNo.yes',
  N: 'common.yesOrNo.no'
};

export const yesOrNoOptions = transformRecordToOption(yesOrNoRecord);

export function getEnableStatusOptions() {
  return [
    {
      label: $t('common.active'),
      value: '1'
    },
    {
      label: $t('common.inactive'),
      value: '2'
    }
  ] satisfies CommonType.Option<Api.Common.EnableStatus, string>[];
}

export const enableStatusOptions = getEnableStatusOptions();

const enableStatusTagTypeMap: Record<Api.Common.EnableStatus, NaiveUI.ThemeColor> = {
  '1': 'success',
  '2': 'warning'
};

export function getEnableStatusTagType(status: Api.Common.EnableStatus): NaiveUI.ThemeColor {
  return enableStatusTagTypeMap[status];
}

export function getEnableStatusLabel(status: Api.Common.EnableStatus): string {
  return status === '1' ? $t('common.active') : $t('common.inactive');
}

export const commonFormModalStyle = { width: 'min(980px, 95vw)' } as const;

export const commonFormModalBodyStyle = {
  maxHeight: '72vh',
  overflowY: 'auto',
  paddingRight: '6px'
} as const;
