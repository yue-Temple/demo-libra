<template>
  <div class="body">
    <div class="login" v-if="isputemail">
      <h4>パスワードの再設定</h4>
      <p>ご利用中のメールアドレスを</p>
      <p>入力してください</p>
      <!-- メールアドレスの入力 -->
      <form @submit.prevent="mailSendforPasswardReset">
        <input
          v-model="email"
          type="email"
          placeholder="メールアドレスを入力"
          class="login-username"
          autocomplete="email"
          required
        />
        <button type="submit" class="login-submit">送信</button>
      </form>

      <!-- エラーメッセージ -->
      <div v-show="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>

    <div class="login" v-if="isputcode">
      <!-- 認証コードの入力 -->
      <h4>ワンタイムパスワードの入力</h4>
      <p>入力されたメールアドレス宛に、</p>
      <p>ワンタイムパスワードを送信しました。</p>
      <p>15分以内に入力してください。</p>
      <form @submit.prevent="verifyEmail">
        <div class="onepass">
          <InputOtp v-model="authcode" :length="6" integerOnly class="rr" />
        </div>
        <button type="submit">送信</button>
      </form>
      <!-- エラーメッセージ -->
      <div v-show="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
    <div class="login" v-if="issetpassword">
      <!-- 認証コードの入力 -->
      <h4>パスワードの再設定</h4>
      <p>認証に成功しました</p>
      <p>新しいパスワードを設定してください</p>
      <form @submit.prevent="resetpassword">
        <PasswordInput
          v-model="newpassword"
          placeholder="新しいパスワードを入力"
        />
        <button type="submit" class="login-submit">送信</button>
      </form>
      <!-- エラーメッセージ -->
      <div v-show="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import InputOtp from 'primevue/inputotp';
import { apipassreset } from '@/stores/apipassreset';
import router from '@/router/router';
import PasswordInput from '@/components/standard/PasswordInput.vue';

const email = ref('');
const newpassword = ref('');
const errorMessage = ref('');
const authcode = ref('');

// 表示用フラグ
const isputemail = ref(true);
const isputcode = ref(false);
const issetpassword = ref(false);

// ワンタイムパスワードの発行
const mailSendforPasswardReset = async () => {
  try {
    const successMessage = await apipassreset.passwordreset(email.value);
    if (successMessage) {
      // 成功時の処理
      isputemail.value = false;
      isputcode.value = true;
      errorMessage.value = '';
    }
  } catch (error) {
    // エラーメッセージを表示
    errorMessage.value = (error as Error).message;
  }
};

// 認証コードの検証
const verifyEmail = async () => {
  try {
    const successMessage = await apipassreset.verifyonepass(
      email.value,
      authcode.value
    );
    if (successMessage) {
      // 成功時の処理
      isputcode.value = false;
      issetpassword.value = true;
      errorMessage.value = '';
    }
  } catch (error) {
    // エラーメッセージを表示
    errorMessage.value = (error as Error).message;
  }
};

// 新しいパスワードを設定
const resetpassword = async () => {
  try {
    const successMessage = await apipassreset.setNewPassword(
      email.value,
      newpassword.value
    );
    if (successMessage) {
      // 成功時の処理
      issetpassword.value = false;
      errorMessage.value = '';
      router.push(`/sign-in`);
      alert('パスワードの更新に成功しました。');
    }
  } catch (error) {
    // エラーメッセージを表示
    errorMessage.value = (error as Error).message;
  }
};
</script>

<style scoped>
.body {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #ffffff;
  z-index: 1; /* 他の要素の背面に配置 */
}
.body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('../src/assets/texture.webp'); /* テクスチャ画像 */
  background-size: cover; /* 全体にフィット */
  background-repeat: no-repeat; /* 繰り返しなし */
  background-position: center top; /* 中央上部 */
  background-attachment: fixed; /* 固定 */
  opacity: 0.07;
  z-index: 2; /* 他の要素の背面に配置 */
}

.login {
  color: #221406;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 350px;
  padding: 10px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login h4 {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
.login p {
  margin: 0;
  font-size: 0.8rem;
}

.login form {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login input[type='email'],
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
}

.login input::placeholder {
  color: #ccc;
}

.login button {
  width: 250px;
  height: 35px;
  background: #ffffff;
  border: none;
  border-radius: 2px;
  color: #221406;
  font-family: 'Exo', sans-serif;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  margin-top: 15px;
  transition: background 0.3s;
  margin-left: 5px;
  box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.2);
}

.login button:hover {
  color: #fff;
  background: #221406;
}

.onepass {
  margin-top: 1rem;
}

.error-message {
  color: red;
  margin-top: 10px;
  font-size: 14px;
}

/* モバイル表示 */
@media (max-width: 600px) {
  .login {
    width: 90%;
  }

  .login input[type='email'],
  .login input[type='password'],
  .login button {
    width: 100%;
  }
}
</style>
