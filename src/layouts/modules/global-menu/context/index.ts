import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useContext } from '@sa/hooks';
import { useRouteStore } from '@/store/modules/route';
import { useThemeStore } from '@/store/modules/theme';
import { useRouterPush } from '@/hooks/common/router';

export const [provideMixMenuContext, useMixMenuContext] = useContext('MixMenu', useMixMenu);

function useMixMenu() {
  const route = useRoute();
  const routeStore = useRouteStore();
  const themeStore = useThemeStore();
  const { selectedKey } = useMenu();
  const { routerPushByKeyWithMetaQuery } = useRouterPush();

  const allMenus = computed<App.Global.Menu[]>(() => routeStore.menus);

  const firstLevelMenus = computed<App.Global.Menu[]>(() =>
    routeStore.menus.map(menu => {
      const { children: _, ...rest } = menu;

      return rest;
    })
  );

  const activeFirstLevelMenuKey = ref('');

  function setActiveFirstLevelMenuKey(key: string) {
    activeFirstLevelMenuKey.value = key;
  }

  function getActiveFirstLevelMenuKey() {
    const [firstLevelMenuKey] = routeStore.getSelectedMenuKeyPath(selectedKey.value);

    setActiveFirstLevelMenuKey(firstLevelMenuKey || selectedKey.value);
  }

  const isActiveFirstLevelMenuHasChildren = computed(() => {
    if (!activeFirstLevelMenuKey.value) {
      return false;
    }

    const findItem = allMenus.value.find(item => item.key === activeFirstLevelMenuKey.value);

    return Boolean(findItem?.children?.length);
  });

  function navigateByMenuKey(menuKey: string) {
    const routeKey = routeStore.getMenuRouteKey(menuKey);

    if (!routeKey) {
      return;
    }

    routerPushByKeyWithMetaQuery(routeKey);
  }

  function handleSelectFirstLevelMenu(key: string) {
    setActiveFirstLevelMenuKey(key);

    if (!isActiveFirstLevelMenuHasChildren.value) {
      navigateByMenuKey(key);
    }
  }

  const secondLevelMenus = computed<App.Global.Menu[]>(
    () => allMenus.value.find(menu => menu.key === activeFirstLevelMenuKey.value)?.children || []
  );

  const activeSecondLevelMenuKey = ref('');

  function setActiveSecondLevelMenuKey(key: string) {
    activeSecondLevelMenuKey.value = key;
  }

  function getActiveSecondLevelMenuKey() {
    const keyPath = routeStore.getSelectedMenuKeyPath(selectedKey.value);
    const secondLevelMenuKey = keyPath[1];

    if (!secondLevelMenuKey) {
      setActiveSecondLevelMenuKey('');
      return;
    }

    setActiveSecondLevelMenuKey(secondLevelMenuKey);
  }

  const isActiveSecondLevelMenuHasChildren = computed(() => {
    if (!activeSecondLevelMenuKey.value) {
      return false;
    }

    const findItem = secondLevelMenus.value.find(item => item.key === activeSecondLevelMenuKey.value);

    return Boolean(findItem?.children?.length);
  });

  function handleSelectSecondLevelMenu(key: string) {
    setActiveSecondLevelMenuKey(key);

    if (!isActiveSecondLevelMenuHasChildren.value) {
      navigateByMenuKey(key);
    }
  }

  const childLevelMenus = computed<App.Global.Menu[]>(
    () => secondLevelMenus.value.find(menu => menu.key === activeSecondLevelMenuKey.value)?.children || []
  );

  const hasChildLevelMenus = computed(() => childLevelMenus.value.length > 0);

  function getDeepestLevelMenuKey(): string | null {
    if (!secondLevelMenus.value.length || !themeStore.sider.autoSelectFirstMenu) {
      return null;
    }

    const secondLevelFirstMenu = secondLevelMenus.value[0];

    if (!secondLevelFirstMenu) {
      return null;
    }

    function findDeepest(menu: App.Global.Menu): string {
      if (!menu.children?.length) {
        return menu.key;
      }

      return findDeepest(menu.children[0]);
    }

    return findDeepest(secondLevelFirstMenu);
  }

  function activeDeepestLevelMenuKey() {
    const deepestLevelMenuKey = getDeepestLevelMenuKey();
    if (!deepestLevelMenuKey) return;

    // select the deepest second level menu
    handleSelectSecondLevelMenu(deepestLevelMenuKey);
  }

  watch(
    () => route.name,
    () => {
      getActiveFirstLevelMenuKey();
      // if there are child level menus, get the active second level menu key
      if (hasChildLevelMenus.value) {
        getActiveSecondLevelMenuKey();
      }
    },
    { immediate: true }
  );

  return {
    firstLevelMenus,
    activeFirstLevelMenuKey,
    setActiveFirstLevelMenuKey,
    isActiveFirstLevelMenuHasChildren,
    handleSelectFirstLevelMenu,
    getActiveFirstLevelMenuKey,
    secondLevelMenus,
    activeSecondLevelMenuKey,
    setActiveSecondLevelMenuKey,
    isActiveSecondLevelMenuHasChildren,
    handleSelectSecondLevelMenu,
    getActiveSecondLevelMenuKey,
    childLevelMenus,
    hasChildLevelMenus,
    getDeepestLevelMenuKey,
    activeDeepestLevelMenuKey
  };
}

export function useMenu() {
  const route = useRoute();

  const selectedKey = computed(() => {
    const { hideInMenu, activeMenu } = route.meta;
    const name = route.name as string;

    const routeName = (hideInMenu ? activeMenu : name) || name;

    return routeName;
  });

  return {
    selectedKey
  };
}
