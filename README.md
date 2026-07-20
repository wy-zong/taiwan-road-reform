# 🚗 台灣交通改革協作平台

[![GitHub issues](https://img.shields.io/github/issues/wy-zong/taiwan-road-reform)](https://github.com/wy-zong/taiwan-road-reform/issues)
[![Validate](https://github.com/wy-zong/taiwan-road-reform/actions/workflows/validate.yml/badge.svg)](https://github.com/wy-zong/taiwan-road-reform/actions/workflows/validate.yml)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

> 透過群眾協作，改善台灣道路設計，打造更安全的交通環境。

## 專案簡介

這是一個以 GitHub Issues 為資料來源的公民協作平台。參與者可以：

- 🔍 回報道路設計或交通環境問題
- 🗺️ 在互動地圖與列表中查看案件
- 📮 追蹤確認、陳情、處理與改善狀態
- ✅ 以 Pull Request 保存已解決案例

## 如何參與

### 回報道路問題

1. 開啟 [道路問題回報表單](https://github.com/wy-zong/taiwan-road-reform/issues/new/choose)。
2. 填寫地點、縣市、問題類型與問題描述。
3. 建議附上現場照片及含座標的地圖分享連結。
4. 送出後，系統會依表單欄位整理分類標籤並更新網站。

### 協助追蹤

- 瀏覽[現有 Issues](https://github.com/wy-zong/taiwan-road-reform/issues)
- 補充現場資訊或照片
- 參考[陳情教學](docs/how-to-petition.md)向主管機關反映
- 更新案件狀態標籤

### 歸檔已解決案例

1. Fork 本專案。
2. 在 `resolved/` 建立案例 Markdown 檔案。
3. 附上改善前後資料與照片。
4. 提交 PR，並在描述中使用 `Closes #123` 關聯原 Issue。
5. 由社群確認後合併並更新案件狀態。

詳細規範請參考 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 互動地圖

👉 [查看互動地圖](https://wy-zong.github.io/taiwan-road-reform/)

沒有精確座標的案件會以「縣市彙總位置」呈現，不會以隨機偏移模擬實際地點。

## 資料與部署方式

GitHub Issues 與 Labels 是案件的唯一資料來源。當 Issue 開啟、編輯、關閉或變更標籤時，GitHub Actions 會：

1. 執行結構驗證與單元測試。
2. 依 Issue Form 欄位正規化縣市、類型及狀態標籤。
3. 即時從 GitHub API 產生網站 JSON。
4. 將 `website/` 直接部署為 GitHub Pages artifact。

產生的 JSON 不會提交回 `main`，因此不會再出現週期性的機器人提交。詳細設計請參考 [docs/architecture.md](docs/architecture.md)。

## 本機開發

需求：Node.js 20 以上。

```bash
npm install
npm run prepare:local
python -m http.server 8000 --directory website
```

開啟 `http://localhost:8000` 即可使用示範資料預覽。

執行驗證：

```bash
npm run check
```

## 專案結構

```text
├── .github/              # Issue Form、PR 模板與 GitHub Actions
├── config/               # 縣市、問題類型及狀態的唯一分類設定
├── docs/                 # 專案、主管機關及陳情文件
├── fixtures/             # 本機開發示範資料
├── resolved/             # 已解決案例歸檔
├── scripts/              # Issue 解析、標籤正規化與網站資料產生器
├── test/                 # Node.js 單元測試
└── website/              # GitHub Pages 靜態網站
```

## 授權

本專案採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.zh_TW) 授權。

---

**讓我們一起，讓台灣的道路更安全！** 🇹🇼
