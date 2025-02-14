// useLayoutStore.ts
import { defineStore } from 'pinia';
import { themes } from './layouts'; // カラーパレットの定義

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    currentLayout: 'layout1' as string, // デフォルトのレイアウト
  }),
  actions: {
    // レイアウトを変更するアクション
    setLayout(layout: string) {
      if (themes[layout]) {
        this.currentLayout = layout;
        this.applyTheme(); // テーマを適用
      }
    },
    // CSS変数を更新してテーマを適用
    applyTheme() {
      const theme = themes[this.currentLayout];
      if (theme) {
        // トップバー
        document.documentElement.style.setProperty(
          '--top-bar-text',
          theme.topBarText
        );
        document.documentElement.style.setProperty(
          '--top-bar-text-sub',
          theme.topBarTextSub
        );
        document.documentElement.style.setProperty(
          '--top-bar-background',
          theme.topBarBackground
        );
        // トップバーのメニュー
        document.documentElement.style.setProperty(
          '--top-bar-menu-text',
          theme.topBarMenuText
        );
        document.documentElement.style.setProperty(
          '--top-bar-menu-background-80',
          theme.topBarMenuBackground80
        );
        document.documentElement.style.setProperty(
          '--top-bar-menu-background-10',
          theme.topBarMenuBackground10
        );
        document.documentElement.style.setProperty(
          '--top-bar-line',
          theme.topBarLine
        );

        // メニューバー
        document.documentElement.style.setProperty(
          '--menu-bar-text',
          theme.menuBarText
        );
        document.documentElement.style.setProperty(
          '--menu-bar-under',
          theme.menuBarUnder
        );
        document.documentElement.style.setProperty(
          '--menu-bar-under2',
          theme.menuBarUnder2
        );
        document.documentElement.style.setProperty(
          '--menu-bar-line',
          theme.menuBarLine
        );
        document.documentElement.style.setProperty(
          '--menu-bar-background',
          theme.menuBarBackground
        );
        document.documentElement.style.setProperty(
          '--menu-bar-background-sub',
          theme.menuBarBackgroundSub
        );

        // ページ
        document.documentElement.style.setProperty(
          '--page-text',
          theme.pageText
        );
        document.documentElement.style.setProperty(
          '--page-text-sub',
          theme.pageTextSub
        );
        document.documentElement.style.setProperty(
          '--page-accent',
          theme.pageAccent
        );
        document.documentElement.style.setProperty(
          '--page-background',
          theme.pageBackground
        );
        document.documentElement.style.setProperty(
          '--page-background-80',
          theme.pageBackground80
        );
        document.documentElement.style.setProperty(
          '--page-background-10',
          theme.pageBackground10
        );
        document.documentElement.style.setProperty(
          '--page-button',
          theme.pageButton
        );
        document.documentElement.style.setProperty(
          '--page-button-sub',
          theme.pageButtonSub
        );
        document.documentElement.style.setProperty(
          '--page-buttontext',
          theme.pageButtonText
        );

        // シャドウ用カラー
        document.documentElement.style.setProperty('--shadow', theme.shadow);
      }
    },
  },
});
