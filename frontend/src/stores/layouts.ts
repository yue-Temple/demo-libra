export interface LayoutOption {
  // トップバー
  topBarText: string;
  topBarTextSub: string;
  topBarBackground: string;
  // トップバーのメニュー
  topBarMenuText: string;
  topBarMenuBackground80: string;
  topBarMenuBackground10: string;
  topBarLine: string;

  // メニューバー
  menuBarText: string;
  menuBarUnder: string;
  menuBarUnder2: string;
  menuBarLine: string;
  menuBarBackground: string;
  menuBarBackgroundSub: string;

  // ページ
  pageText: string;
  pageTextSub: string;
  pageAccent: string;
  pageBackground: string;
  pageBackground80: string;
  pageBackground10: string;
  pageButton: string;
  pageButtonSub: string;
  pageButtonText: string;

  // シャドウ用カラー
  shadow: string;
}

export const themes: Record<string, LayoutOption> = {
  layout1: {
    // f0eeee(白近) e1e1e4(灰) d1d1d5(灰濃) 1c1f23(黒) bd8f49
    // トップバー
    topBarText: '#ffffff',
    topBarTextSub: '#dae0ee',
    topBarBackground: '#1c1f23',
    topBarLine: '#f0eeee',
    // トップバーのメニュー
    topBarMenuText: '#ffffff',
    topBarMenuBackground80: '#1c1f23CC',
    topBarMenuBackground10: '#ffffff33',

    // メニューバー
    menuBarText: '#1c1f23',
    menuBarUnder: '#bd8f49',
    menuBarUnder2: '#bd8f49',
    menuBarLine: '#292d31',
    menuBarBackground: '#e1e1e4',
    menuBarBackgroundSub: '#000000',

    // ページ
    pageText: '#1c1f23',
    pageTextSub: '#1c1f23',
    pageAccent: '#bd8f49',
    pageBackground: '#ffffff',
    pageBackground80: '#000000',
    pageBackground10: '#d1d1d580',
    // ボタン
    pageButton: '#1c1f23',
    pageButtonSub: '#1c1f23CC',
    pageButtonText: '#ffffff',

    // シャドウ用カラー
    shadow: '#C0C0C06A',
  },
  layout2: {
    // #0f1e3f(紺) 213a56(薄紺) 997953(濃ベ) cdaa80(ベ) e6d4bf(薄ベ)
    // トップバー
    topBarText: '#ffffff',
    topBarTextSub: '#cdaa80',
    topBarBackground: '#0f1e3f',
    topBarLine: '#ffffff',
    // トップバーのメニュー
    topBarMenuText: '#ffffff',
    topBarMenuBackground80: '#0f1e3fCC',
    topBarMenuBackground10: '#ffffff33',

    // メニューバー
    menuBarText: '#ffffff',
    menuBarUnder: '#cdaa80',
    menuBarUnder2: '#cdaa80',
    menuBarLine: '#ffffff',
    menuBarBackground: '#213a56',
    menuBarBackgroundSub: '#000000',

    // ページ
    pageText: '#ffffff',
    pageTextSub: '#ffffff80',
    pageAccent: '#cdaa80',
    pageBackground: '#0f1e3f',
    pageBackground80: '#000000',
    pageBackground10: '#ffffff1A',
    // ボタン
    pageButton: '#cdaa80',
    pageButtonSub: '#997953',
    pageButtonText: '#ffffff',

    // シャドウ用カラー
    shadow: '#C0C0C06A',
  },
  layout3: {
    // f0f2f7(白近) dae0ee(薄青) 991930(赤) b97c8f(薄赤) 292d31(黒近)
    // トップバー
    topBarText: '#ffffff',
    topBarTextSub: '#dae0ee',
    topBarBackground: '#292d31',
    topBarLine: '#f0f2f7',
    // トップバーのメニュー
    topBarMenuText: '#ffffff',
    topBarMenuBackground80: '#292d31CC',
    topBarMenuBackground10: '#ffffff33',

    // メニューバー
    menuBarText: '#292d31',
    menuBarUnder: '#991930',
    menuBarUnder2: '#b97c8f',
    menuBarLine: '#292d31',
    menuBarBackground: '#dae0ee',
    menuBarBackgroundSub: '#000000',

    // ページ
    pageText: '#292d31',
    pageTextSub: '#292d3180',
    pageAccent: '#991930',
    pageBackground: '#f0f2f7',
    pageBackground80: '#292d3199',
    pageBackground10: '#292d311A',
    // ボタン
    pageButton: '#991930',
    pageButtonSub: '#b97c8f',
    pageButtonText: '#ffffff',

    // シャドウ用カラー
    shadow: '#C0C0C06A',
  },
  layout4: {
    // fcd5cf(薄ぴ) ffa094(濃ぴ) 5c9593(青緑) 3c8fa6(濃緑)
    // トップバー
    topBarText: '#ffffff',
    topBarTextSub: '#fcd5cf',
    topBarBackground: '#3c8fa6',
    topBarLine: '#fcd5cf',
    // トップバーのメニュー
    topBarMenuText: '#ffffff',
    topBarMenuBackground80: '#3c8fa6CC',
    topBarMenuBackground10: '#ffffff33',

    // メニューバー
    menuBarText: '#ffffff',
    menuBarUnder: '#fcd5cf',
    menuBarUnder2: '#fcd5cf',
    menuBarLine: '#fcd5cf',
    menuBarBackground: '#ffa094',
    menuBarBackgroundSub: '#000000',

    // ページ
    pageText: '#3c8fa6',
    pageTextSub: '#3c8fa680',
    pageAccent: '#ffa094',
    pageBackground: '#ffffff',
    pageBackground80: '#292d3199',
    pageBackground10: '#292d311A',
    // ボタン
    pageButton: '#3c8fa6',
    pageButtonSub: '#5c9593',
    pageButtonText: '#ffffff',

    // シャドウ用カラー
    shadow: '#0000006A',
  },
};
