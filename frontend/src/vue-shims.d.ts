/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
declare module 'v-click-outside' {
  import { DirectiveBinding } from 'vue';

  export const directive: {
    mounted(el: HTMLElement, binding: DirectiveBinding): void;
    unmounted(el: HTMLElement): void;
  };
}
