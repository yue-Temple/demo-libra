<template>
  <div class="custom-calendar">
    ▾年月日
    <!-- テキストボックス -->
    <input
      type="text"
      :value="displayDate"
      @click.stop="toggleCalendar"
      readonly
      class="date-input"
    />

    <!-- カレンダー部分 -->
    <div v-if="isCalendarOpen" class="calendar-popup" @click.stop>
      <div class="calendar-header">
        <!-- 前月ボタン -->
        <button type="button" @click.stop="prevMonth($event)" class="yazirusi">
          ←
        </button>
        <!-- 年月表示 -->
        <span @click.stop="toggleYearPicker"
          >{{ currentYear }}年 {{ currentMonth + 1 }}月</span
        >
        <!-- 次月ボタン -->
        <button type="button" @click.stop="nextMonth($event)" class="yazirusi">
          →
        </button>
      </div>

      <!-- 年選択部分 -->
      <div v-if="isYearPickerOpen" class="year-picker">
        <div
          v-for="year in years"
          :key="year"
          class="year"
          :class="{ selected: year === currentYear }"
          @click.stop="selectYear(year)"
        >
          {{ year }}
        </div>
      </div>

      <!-- カレンダーグリッド -->
      <div v-else class="calendar-grid">
        <!-- 曜日の表示 -->
        <div class="calendar-day header" v-for="day in weekDays" :key="day">
          {{ day }}
        </div>
        <!-- 空白のセル -->
        <div
          v-for="blank in blankDays"
          :key="'blank-' + blank"
          class="calendar-day blank"
        ></div>
        <!-- 日付のセル -->
        <div
          v-for="day in daysInMonth"
          :key="day"
          class="calendar-day"
          :class="{ selected: isSelected(day) }"
          @click.stop="selectDate(day)"
        >
          {{ day }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';

export default {
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const currentDate = ref(new Date());
    const selectedDates = ref([...props.modelValue]);
    const isCalendarOpen = ref(false);
    const isYearPickerOpen = ref(false);

    // 現在の年と月を取得
    const currentYear = computed(() => currentDate.value.getFullYear());
    const currentMonth = computed(() => currentDate.value.getMonth());

    // 月の日数を計算
    const daysInMonth = computed(() => {
      const year = currentYear.value;
      const month = currentMonth.value;
      return new Date(year, month + 1, 0).getDate();
    });

    // 月の最初の日の曜日を取得
    const firstDayOfMonth = computed(() => {
      const year = currentYear.value;
      const month = currentMonth.value;
      return new Date(year, month, 1).getDay();
    });

    // 空白のセルの数を計算
    const blankDays = computed(() => {
      return firstDayOfMonth.value;
    });

    // 表示用の日付
    const displayDate = computed(() => {
      return selectedDates.value.length > 0
        ? selectedDates.value.join(', ')
        : '日付を選択してください';
    });

    // 年のリストを生成
    const years = computed(() => {
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);
    });

    // 曜日のリスト
    const weekDays = computed(() => {
      return ['日', '月', '火', '水', '木', '金', '土'];
    });

    // 前の月に移動
    const prevMonth = (event) => {
      event.preventDefault(); // デフォルトの動作を防ぐ
      event.stopPropagation(); // イベントの伝播を停止
      const newDate = new Date(currentDate.value);
      newDate.setMonth(newDate.getMonth() - 1);
      currentDate.value = newDate; // currentDateを更新
    };

    // 次の月に移動
    const nextMonth = (event) => {
      event.preventDefault(); // デフォルトの動作を防ぐ
      event.stopPropagation(); // イベントの伝播を停止
      const newDate = new Date(currentDate.value);
      newDate.setMonth(newDate.getMonth() + 1);
      currentDate.value = newDate; // currentDateを更新
    };

    // 日付を昇順でソートする関数
    const sortDates = (dates) => {
      return dates.sort((a, b) => {
        // YYYY-MM-DD 形式の文字列を直接比較
        return a.localeCompare(b);
      });
    };

    // 日付を選択
    const selectDate = (day) => {
      const date = new Date(currentYear.value, currentMonth.value, day);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 月を2桁で表示
      const dayFormatted = String(date.getDate()).padStart(2, '0'); // 日を2桁で表示
      const dateString = `${year}-${month}-${dayFormatted}`; // YYYY-MM-DD形式

      if (selectedDates.value.includes(dateString)) {
        // 既に選択されている場合は削除
        selectedDates.value = selectedDates.value.filter(
          (d) => d !== dateString
        );
      } else {
        // 選択されていない場合は追加
        selectedDates.value.push(dateString);
        // 日付を昇順でソート
        selectedDates.value = sortDates(selectedDates.value);
      }

      // 親コンポーネントに選択された日付を渡す
      emit('update:modelValue', selectedDates.value);
    };

    // 選択された日付かどうかを判定
    const isSelected = (day) => {
      const date = new Date(currentYear.value, currentMonth.value, day);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dayFormatted = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${dayFormatted}`;
      return selectedDates.value.includes(dateString);
    };

    // 年を選択
    const selectYear = (year) => {
      const newDate = new Date(currentDate.value);
      newDate.setFullYear(year);
      currentDate.value = newDate;
      isYearPickerOpen.value = false;
    };

    // カレンダーの表示/非表示を切り替え
    const toggleCalendar = () => {
      isCalendarOpen.value = !isCalendarOpen.value;
      isYearPickerOpen.value = false;
    };

    // 年選択の表示/非表示を切り替え
    const toggleYearPicker = () => {
      isYearPickerOpen.value = !isYearPickerOpen.value;
    };

    // ドキュメント全体のクリックイベントを処理
    const handleDocumentClick = (event) => {
      const calendarPopup = document.querySelector('.calendar-popup');
      const dateInput = document.querySelector('.date-input');

      // calendarPopup または dateInput が null の場合は処理を終了
      if (!calendarPopup || !dateInput) {
        return;
      }

      // カレンダー部分またはテキストボックスがクリックされた場合は何もしない
      if (
        calendarPopup.contains(event.target) ||
        dateInput.contains(event.target)
      ) {
        return;
      }

      // カレンダー部分以外がクリックされた場合はカレンダーを閉じる
      isCalendarOpen.value = false;
    };
    // コンポーネントがマウントされたときにイベントリスナーを追加
    onMounted(() => {
      document.addEventListener('click', handleDocumentClick);
    });

    // コンポーネントがアンマウントされたときにイベントリスナーを削除
    onUnmounted(() => {
      document.removeEventListener('click', handleDocumentClick);
    });

    return {
      currentYear,
      currentMonth,
      daysInMonth,
      displayDate,
      years,
      weekDays,
      blankDays,
      isCalendarOpen,
      isYearPickerOpen,
      prevMonth,
      nextMonth,
      selectDate,
      isSelected,
      selectYear,
      toggleCalendar,
      toggleYearPicker,
    };
  },
};
</script>

<style scoped>
.custom-calendar {
  position: relative;
}

.date-input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.calendar-popup {
  position: absolute;
  top: 50%;
  left: -5%;
  background-color: var(--page-background);
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transform: scale(85%);
}

@media (max-width: 600px) {
  .calendar-popup {
    position: absolute;
    top: 37%;
    left: -10%;
    background-color: var(--page-background);
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 10px;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transform: scale(80%);
  }
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.calendar-header button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.calendar-header span {
  cursor: pointer;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.calendar-day {
  padding: 10px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.calendar-day.header {
  font-weight: bold;
  background-color: var(--page-background-10);
  cursor: default;
}

.calendar-day.blank {
  background-color: transparent;
  border: none;
  cursor: default;
}

.calendar-day.selected {
  background-color: var(--page-button);
  color: var(--page-buttontext);
}

.year-picker {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}

.year {
  padding: 10px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.year.selected {
  background-color: var(--page-button);
  color: var(--page-buttontext);
}
.yazirusi {
  color: var(--page-text);
}
</style>
