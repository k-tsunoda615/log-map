<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-app-bar-title>Vuetify テスト</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>mdi-bell</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12">
            <h1 class="text-h3 mb-6">Vuetify コンポーネントテスト</h1>
          </v-col>
        </v-row>

        <!-- ボタンテスト -->
        <v-row>
          <v-col cols="12">
            <v-card class="mb-6">
              <v-card-title>ボタンテスト</v-card-title>
              <v-card-text>
                <v-btn color="primary" class="ma-2">Primary</v-btn>
                <v-btn color="secondary" class="ma-2">Secondary</v-btn>
                <v-btn color="success" class="ma-2">Success</v-btn>
                <v-btn color="error" class="ma-2">Error</v-btn>
                <v-btn color="warning" class="ma-2">Warning</v-btn>
                <v-btn color="info" class="ma-2">Info</v-btn>
                <v-btn variant="outlined" class="ma-2">Outlined</v-btn>
                <v-btn variant="text" class="ma-2">Text</v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- フォームテスト -->
        <v-row>
          <v-col cols="12" md="6">
            <v-card class="mb-6">
              <v-card-title>フォームテスト</v-card-title>
              <v-card-text>
                <v-text-field
                  v-model="formData.name"
                  label="名前"
                  variant="outlined"
                  class="mb-3"
                ></v-text-field>
                <v-text-field
                  v-model="formData.email"
                  label="メールアドレス"
                  type="email"
                  variant="outlined"
                  class="mb-3"
                ></v-text-field>
                <v-select
                  v-model="formData.country"
                  :items="countries"
                  label="国"
                  variant="outlined"
                  class="mb-3"
                ></v-select>
                <v-checkbox
                  v-model="formData.agree"
                  label="利用規約に同意する"
                  class="mb-3"
                ></v-checkbox>
                <v-btn color="primary" @click="submitForm">送信</v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="mb-6">
              <v-card-title>アラートテスト</v-card-title>
              <v-card-text>
                <v-alert type="success" variant="tonal" class="mb-3">
                  成功メッセージです！
                </v-alert>
                <v-alert type="warning" variant="tonal" class="mb-3">
                  警告メッセージです！
                </v-alert>
                <v-alert type="error" variant="tonal" class="mb-3">
                  エラーメッセージです！
                </v-alert>
                <v-alert type="info" variant="tonal">
                  情報メッセージです！
                </v-alert>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- データテーブルテスト -->
        <v-row>
          <v-col cols="12">
            <v-card class="mb-6">
              <v-card-title>データテーブルテスト</v-card-title>
              <v-data-table
                :headers="headers"
                :items="desserts"
                :items-per-page="5"
                class="elevation-1"
              ></v-data-table>
            </v-card>
          </v-col>
        </v-row>

        <!-- ダイアログテスト -->
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>ダイアログテスト</v-card-title>
              <v-card-text>
                <v-btn color="primary" @click="dialog = true">
                  ダイアログを開く
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- ダイアログ -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>テストダイアログ</v-card-title>
        <v-card-text>
          これはVuetifyのダイアログコンポーネントのテストです。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="dialog = false">閉じる</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref } from "vue";

// フォームデータ
const formData = ref({
  name: "",
  email: "",
  country: "",
  agree: false,
});

// 国リスト
const countries = [
  "日本",
  "アメリカ",
  "イギリス",
  "フランス",
  "ドイツ",
  "中国",
  "韓国",
];

// ダイアログの状態
const dialog = ref(false);

// データテーブルのヘッダー
const headers = [
  { title: "デザート", key: "name" },
  { title: "カロリー", key: "calories" },
  { title: "脂肪", key: "fat" },
  { title: "炭水化物", key: "carbs" },
  { title: "タンパク質", key: "protein" },
];

// データテーブルのデータ
const desserts = [
  {
    name: "フローズンヨーグルト",
    calories: 159,
    fat: 6.0,
    carbs: 24,
    protein: 4.0,
  },
  {
    name: "アイスクリームサンドイッチ",
    calories: 237,
    fat: 9.0,
    carbs: 37,
    protein: 4.3,
  },
  {
    name: "エクレア",
    calories: 262,
    fat: 16.0,
    carbs: 23,
    protein: 6.0,
  },
  {
    name: "カップケーキ",
    calories: 305,
    fat: 3.7,
    carbs: 67,
    protein: 4.3,
  },
  {
    name: "ジンジャーブレッド",
    calories: 356,
    fat: 16.0,
    carbs: 49,
    protein: 3.9,
  },
];

// フォーム送信処理
const submitForm = () => {
  console.log("フォームデータ:", formData.value);
  alert("フォームが送信されました！");
};
</script>
