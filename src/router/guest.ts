import type { App } from 'vue';
import type { RouteRecordRaw, RouterHistory } from 'vue-router';
import { createMemoryHistory, createRouter, createWebHashHistory, createWebHistory } from 'vue-router';

const { VITE_ROUTER_HISTORY_MODE = 'history', VITE_BASE_URL } = import.meta.env;

const historyCreatorMap: Record<Env.RouterHistoryMode, (base?: string) => RouterHistory> = {
  hash: createWebHashHistory,
  history: createWebHistory,
  memory: createMemoryHistory
};

const guestRoutes: RouteRecordRaw[] = [
  {
    name: 'login',
    path: '/login/:module(pwd-login|code-login|register|reset-pwd|bind-wechat)?',
    alias: ['/'],
    component: () => import('@/views/_builtin/login/index.vue'),
    props: true,
    meta: {
      title: 'login',
      i18nKey: 'route.login',
      constant: true
    }
  },
  {
    name: '403',
    path: '/403',
    component: () => import('@/views/_builtin/403/index.vue'),
    meta: {
      title: '403',
      i18nKey: 'route.403',
      constant: true
    }
  },
  {
    name: '500',
    path: '/500',
    component: () => import('@/views/_builtin/500/index.vue'),
    meta: {
      title: '500',
      i18nKey: 'route.500',
      constant: true
    }
  },
  {
    name: '404',
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/_builtin/404/index.vue'),
    meta: {
      title: '404',
      i18nKey: 'route.404',
      constant: true
    }
  }
];

export const guestRouter = createRouter({
  history: historyCreatorMap[VITE_ROUTER_HISTORY_MODE](VITE_BASE_URL),
  routes: guestRoutes
});

export async function setupGuestRouter(app: App) {
  app.use(guestRouter);
  await guestRouter.isReady();
}
