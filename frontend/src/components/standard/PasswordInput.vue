<template>
    <div class="password-wrapper">
      <input
        :value="modelValue"
        @input="updateValue"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="placeholder"
        class="login-password"
        required
      />
      <i
        :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"
        @click="togglePassword"
        class="eye-icon"
      ></i>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  // props の定義
  const props = defineProps({
    modelValue: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: 'パスワードを入力',
    },
  });
  
  // emit の定義
  const emit = defineEmits(['update:modelValue']);
  
  // パスワードの表示/非表示
  const showPassword = ref(false);
  
  // パスワード表示/非表示切り替え
  const togglePassword = () => {
    showPassword.value = !showPassword.value;
  };
  
  // 入力値を親コンポーネントに伝播
  const updateValue = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
  };
  </script>
  
  <style scoped>
.login input[type='text'],
.login input[type='password'] {
  width: 250px;
  height: 30px;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.6);
  border-radius: 2px;
  color: #221406;
  font-family: 'Exo', sans-serif;
  font-size: 16px;
  font-weight: 400;
  padding: 4px;
  margin-top: 10px;
  padding-right: 40px;
}

.login input::placeholder {
  color: #ccc;
}
  .password-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  
  .login-password {
    width: 100%;
    padding-right: 40px; /* アイコン分の余白を確保 */
    display: flex;
    align-items: center;
  }
  
  .eye-icon {
    position: absolute;
    margin-top: 10px;
    margin-right: 3px;
    right: 10px;
    cursor: pointer;
    font-size: 1.2rem;
    color: #666;
  }
  
  .eye-icon:hover {
    color: #333;
  }

  /* モバイル表示 */
@media (max-width: 600px) {
  .login input[type='text'],
  .login input[type='password']{
    width: 100%;
  }
}
  </style>