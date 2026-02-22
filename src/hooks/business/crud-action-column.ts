import { h } from 'vue';
import { NButton, NPopconfirm, NTooltip } from 'naive-ui';
import { $t } from '@/locales';

interface CrudActionColumnOptions<RowData> {
  canManage: boolean;
  canEditRow?: (row: RowData) => boolean;
  canDeleteRow?: (row: RowData) => boolean;
  getEditDisabledTooltip?: (row: RowData) => string | null | undefined;
  getDeleteDisabledTooltip?: (row: RowData) => string | null | undefined;
  onView: (row: RowData) => void;
  onEdit: (row: RowData) => void;
  onDelete: (row: RowData) => void | Promise<void>;
}

export function createCrudActionColumn<RowData>(
  options: CrudActionColumnOptions<RowData>
): NaiveUI.TableColumn<RowData> {
  function renderTooltipButton(label: string, type: 'primary' | 'error', tooltip: string) {
    return h(
      NTooltip,
      {},
      {
        trigger: () =>
          h(
            'span',
            {
              class: 'inline-flex'
            },
            [
              h(
                NButton,
                {
                  type,
                  ghost: true,
                  size: 'small',
                  disabled: true
                },
                { default: () => label }
              )
            ]
          ),
        default: () => tooltip
      }
    );
  }

  return {
    key: 'operate',
    title: $t('common.operate'),
    align: 'center',
    width: options.canManage ? 220 : 96,
    fixed: 'right',
    render: row => {
      const canEditRow = options.canEditRow ? options.canEditRow(row) : options.canManage;
      const canDeleteRow = options.canDeleteRow ? options.canDeleteRow(row) : options.canManage;

      const viewButton = h(
        NButton,
        {
          type: 'default',
          ghost: true,
          size: 'small',
          onClick: () => options.onView(row)
        },
        { default: () => $t('common.view') }
      );

      if (!options.canManage) {
        return h('div', { class: 'flex-center gap-8px' }, [viewButton]);
      }

      const actions = [viewButton];

      if (canEditRow) {
        actions.push(
          h(
            NButton,
            {
              type: 'primary',
              ghost: true,
              size: 'small',
              onClick: () => options.onEdit(row)
            },
            { default: () => $t('common.edit') }
          )
        );
      } else {
        const tooltip = options.getEditDisabledTooltip?.(row);
        if (tooltip) {
          actions.push(renderTooltipButton($t('common.edit'), 'primary', tooltip));
        }
      }

      if (canDeleteRow) {
        actions.push(
          h(
            NPopconfirm,
            { onPositiveClick: () => options.onDelete(row) },
            {
              default: () => $t('common.confirmDelete'),
              trigger: () =>
                h(
                  NButton,
                  {
                    type: 'error',
                    ghost: true,
                    size: 'small'
                  },
                  { default: () => $t('common.delete') }
                )
            }
          )
        );
      } else {
        const tooltip = options.getDeleteDisabledTooltip?.(row);
        if (tooltip) {
          actions.push(renderTooltipButton($t('common.delete'), 'error', tooltip));
        }
      }

      return h('div', { class: 'flex-center gap-8px' }, actions);
    }
  };
}
