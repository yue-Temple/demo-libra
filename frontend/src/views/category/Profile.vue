<template>
  <div class="home">
    <TopBar />
    <MenuBar />
    <!-- isOwner:オーナー確認 InfoBlock:操作対象 -->
    <InfoBlockManager
      :infoBlocks="InfoBlock"
      @save-page="saveprofile"
      @update-text-block-content="updateTextBlockContent"
      @update-button-block-buttons="updateButtonBlockButtons"
      @update-textbutton-button="updateTextButtonButton"
      @update-info-blocks="updateInfoBlocks"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useProfileStore } from '@/stores/profileStore';
import TopBar from '@/components/standard/topbar.vue';
import MenuBar from '@/components/standard/menubar.vue';
import InfoBlockManager from '@/components/blockscomponents/InfoBlockManager.vue';
import { InfoBlock, Button } from '@sharetypes';

export default defineComponent({
  components: {
    TopBar,
    MenuBar,
    InfoBlockManager,
  },
  setup() {
    const route = useRoute();
    const toast = useToast();
    const profileStore = useProfileStore();

    const InfoBlock = ref<InfoBlock[]>([]);
    const oldInfoBlock = ref<InfoBlock[]>([]); // 変更前のデータを保持する変数

    onMounted(() => {
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
    });

    // 保存
    const saveprofile = async () => {
      try {
        // 変更がない場合の判定（深い比較）
        if (
          JSON.stringify(oldInfoBlock.value) === JSON.stringify(InfoBlock.value)
        ) {
          console.log('変更がないため、保存をスキップします。');
          toast.success('保存されました');
          return;
        }

        // 変更がある場合、保存処理を実行
        await profileStore.saveProfile(InfoBlock.value);
        toast.success('保存されました');

        // 保存後にoldInfoBlockを更新
        oldInfoBlock.value = JSON.parse(JSON.stringify(InfoBlock.value));
      } catch (error) {
        toast.error('保存に失敗しました');
      }
    };

    // 内容更新
    const updateTextBlockContent = (blockId: string, content: string) => {
      const block = InfoBlock.value.find((b) => b.id === blockId);
      if (block && block.type === 'text') {
        block.content = content;
      }
    };
    const updateButtonBlockButtons = (blockId: string, buttons: Button[]) => {
      const block = InfoBlock.value.find((b) => b.id === blockId);
      if (block && block.type === 'button') {
        block.buttons = buttons;
      }
    };
    const updateTextButtonButton = (blockId: string, button: Button) => {
      const block = InfoBlock.value.find((b) => b.id === blockId);
      if (block && block.type === 'textbutton') {
        block.button = button;
      }
    };

    // 全部更新
    const updateInfoBlocks = (newBlocks: InfoBlock[]) => {
      InfoBlock.value = newBlocks;
    };

    return {
      InfoBlock,
      saveprofile,
      updateTextBlockContent,
      updateButtonBlockButtons,
      updateTextButtonButton,
      updateInfoBlocks,
    };
  },
});
</script>

<style scoped>
.home {
  margin-top: 100px;
  position: relative;
  padding-bottom: 80px;
}
.body {
  font-size: clamp(9px, 2.5vw, 18px);
}
</style>
