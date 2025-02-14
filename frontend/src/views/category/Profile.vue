<template>
  <div>
    <TopBar />
    <MenuBar />
    <div class="home">
      <div class="field">
        <InfoBlockManager
          :infoBlocks="InfoBlock"
          @save-page="saveprofile"
          @update-info-blocks="updateInfoBlocks"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useProfileStore } from '@/stores/profileStore';
import TopBar from '@/components/standard/topbar.vue';
import MenuBar from '@/components/standard/menubar.vue';
import InfoBlockManager from '@/components/blockscomponents/InfoBlockManager.vue';
import { InfoBlock } from '@sharetypes';
import { getOldObjectKeys } from '@/rogics/getOldObjectKey';
import { useUserStore } from '@/stores/userStore';

const route = useRoute();
const toast = useToast();
const userStore = useUserStore();
const profileStore = useProfileStore();

const InfoBlock = ref<InfoBlock[]>([]);
const oldInfoBlock = ref<InfoBlock[]>([]); // 変更前のデータを保持する変数
const addBlocks = ref<InfoBlock[]>([]);
const deleteBlocks = ref<InfoBlock[]>([]);

onMounted(async () => {
  await userStore.fetchFeatures(Number(route.params.userNumber));
  if (userStore.menuFetched) {
    profileStore
      .fetchProfileBlocks(Number(route.params.userNumber))
      .then(() => {
        InfoBlock.value = profileStore.getProfileBlocks; // ストアのデータをセット
        oldInfoBlock.value = JSON.parse(
          JSON.stringify(profileStore.getProfileBlocks)
        ); // 初期データをdeep copy
      })
      .catch((error) => {
        console.error('失敗しました', error);
      });
  }
  window.scrollTo(0, 0);
});

// 保存
const saveprofile = async () => {
  try {
    // 変更がない場合の判定（深い比較）
    if (
      JSON.stringify(oldInfoBlock.value) === JSON.stringify(InfoBlock.value)
    ) {
      console.log('変更がないため、保存をスキップします。');
      toast.success('保存しました');
      return;
    }

    // old_object_key 配列を作成
    const old_object_keys = getOldObjectKeys(
      InfoBlock.value,
      oldInfoBlock.value
    );

    // 変更がある場合、保存処理を実行
    await profileStore.saveProfile(
      InfoBlock.value,
      deleteBlocks.value,
      old_object_keys
    );
    toast.success('保存しました');
    // 保存後にoldInfoBlockを更新
    oldInfoBlock.value = JSON.parse(JSON.stringify(InfoBlock.value));
    // フラグ配列を初期化
    addBlocks.value = [];
    deleteBlocks.value = [];
  } catch (error) {
    toast.error('保存に失敗しました');
    // フラグ配列を初期化
    addBlocks.value = [];
    deleteBlocks.value = [];
  }
};

// 全部更新メソッド
const updateInfoBlocks = (
  newBlocks: InfoBlock[],
  addblock: InfoBlock,
  deleteblock: InfoBlock
) => {
  // 1. 新しいブロックリストをセット
  InfoBlock.value = newBlocks;

  // 2. 追加されたブロックを addBlocks に追加
  if (addblock) {
    addBlocks.value.push(addblock);
  }

  // 3. 削除されたブロックを deleteBlocks に追加
  if (deleteblock) {
    // addBlocks 配列に deleteblock と同じブロックがあるかどうかを確認
    const index = addBlocks.value.findIndex(
      (block) => block.id === deleteblock.id
    );
    // addBlocks 配列に同じブロックがある場合そのブロックを削除、ない場合、deleteBlocks 配列に追加
    if (index !== -1) {
      addBlocks.value.splice(index, 1);
    } else {
      deleteBlocks.value.push(deleteblock);
    }
  }
};
</script>

<style scoped>
.home {
  margin-top: 100px;
  position: relative;
  padding-bottom: 80px;
}

.field {
  max-width: 1000px;
  margin: 0 auto;
}
</style>
