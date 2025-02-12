// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { checkUserExists } from './checkUser';
// 基本ページ
import TopPage from '../views/standard/TopPage.vue';
import SignIn from '../views/standard/SignIn.vue';
import SignUp from '../views/standard/SignUp.vue';
import UserConfig from '../views/standard/UserConfig.vue';
import AuthSuccess from '@/views/standard/AuthSuccess.vue';
import ErrorPage from '@/views/standard/ErrorPage.vue';

// サブフォルダに格納したコンポーネントをインポート
import Profile from '../views/category/Profile.vue';
import CharaList from '../views/category/CharaList.vue';
import CharacterDetail from '../views/category/CharacterDetail.vue';
import HistorySession from '../views/category/HistorySession.vue';
import HistoryDetail from '@/views/category/HistoryDetail.vue';

// 追加実装予定
import HistoryAnalyze from '../views/addcategory/HistoryAnalyze.vue';
import RelationCreate from '../views/addcategory/RelationCreate.vue';

const routes = [
  {
    path: '/',
    name: 'TopPage',
    component: TopPage,
  },
  {
    path: '/sign-in',
    name: 'SignIn',
    component: SignIn,
  },
  {
    path: '/sign-up',
    name: 'SignUp',
    component: SignUp,
  },
  // ユーザーIDをURLパラメータとして受け取る
  {
    path: '/:userId/user-config',
    name: 'UserConfig',
    component: UserConfig,
    props: true, // URLパラメータをコンポーネントに渡す
  },
  {
    path: '/:userNumber/profile',
    name: 'Profile',
    component: Profile,
    props: true,
  },
  {
    path: '/:userNumber/chara',
    name: 'CharaList',
    component: CharaList,
    props: true,
  },
  {
    path: '/:userNumber/chara/:id',
    name: 'CharacterDetail',
    component: CharacterDetail,
    props: true,
  },
  {
    path: '/:userNumber/history',
    name: 'HistorySession',
    component: HistorySession,
    props: true,
  },
  {
    path: '/:userNumber/history/:id',
    name: 'HistoryDetail',
    component: HistoryDetail,
    props: true,
  },
  {
    path: '/auth-success',
    name: 'AuthSuccess',
    component: AuthSuccess,
    props: true,
  },
  {
    path: '/error',
    name: 'ErrorPage',
    component: ErrorPage,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
});

// ナビゲーションガードの設定
router.beforeEach(async (to, from, next) => {
  // ユーザー番号が必要なルートかどうかを確認
  if (to.params.userNumber) {
    const userNumber = to.params.userNumber as string;
    const userExists = await checkUserExists(userNumber);

    if (!userExists) {
      // ユーザーが存在しない場合はエラーページにリダイレクト
      next({ name: 'ErrorPage' });
    } else {
      // ユーザーが存在する場合は通常通り進む
      next();
    }
  } else {
    // ユーザー番号が不要なルートはそのまま進む
    next();
  }
});

export default router;
