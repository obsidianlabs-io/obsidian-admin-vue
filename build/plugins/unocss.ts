import process from 'node:process';
import path from 'node:path';
import unocss from '@unocss/vite';
import presetIcons from '@unocss/preset-icons';
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders';

export function setupUnocss(viteEnv: Env.ImportMeta) {
  const iconPrefix = viteEnv.VITE_ICON_PREFIX ?? 'icon';
  const iconLocalPrefix = viteEnv.VITE_ICON_LOCAL_PREFIX ?? 'icon-local';

  const localIconPath = path.join(process.cwd(), 'src/assets/svg-icon');

  /** The name of the local icon collection */
  const collectionName = iconLocalPrefix.replace(`${iconPrefix}-`, '');

  return unocss({
    presets: [
      presetIcons({
        prefix: `${iconPrefix}-`,
        scale: 1,
        extraProperties: {
          display: 'inline-block'
        },
        collections: {
          [collectionName]: FileSystemIconLoader(localIconPath, svg =>
            svg.replace(/^<svg\s/, '<svg width="1em" height="1em" ')
          )
        },
        warn: true
      })
    ]
  });
}
