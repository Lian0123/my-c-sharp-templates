# REC-DOCS-20261108-002 · 功能、UML 與開發規則交付摘要

本次針對上一輪僅有主要需求分組的缺口，新增三份功能契約、四份原生 UML 圖及一份規則／任務契約頁。權威仍為 SVG 的 m:source；catalog.json 與 features.json 都是可重生索引，沒有另一份手寫規格。

26 個 FEAT 描述輸入、輸出、角色／權限、資料與交易、同步副作用、失敗／重試、邊界、不做範圍、修改範圍、契約、實作、測試、Given／When／Then 完成條件及回復。Auth／Account／Message 的 25 個公開業務介面操作各有唯一歸屬。AuthService／ChatService 仍共用多個操作的實作；本次沒有把功能契約冒稱為已完成逐功能 class 重構。

新增使用案例的角色／系統邊界與橢圓、活動圖的初始／結束／判斷與 guard、單一 Session 的狀態轉移，以及 Compose 部署節點／artifact／網路／Volume。活動／狀態圖使用有向主流程、編號分支與重試迴圈，關係目錄保留 trigger／guard／effect；Refresh 另建新 Session，原 Session 不復活。既有類別／分層、ERD、元件、時序與附件生命週期持續保留。這是受控 UML／MISVG 子集，不宣稱完整 metamodel 或互通認證。

| 本次驗證 | 結果 | 範圍 |
|---|---|---|
| Tooling | pass | 88 項通過；新增 25 項功能、架構、Gateway 與 UML 正常／錯誤回歸 |
| 功能與規則 | pass | 26 FEAT；25/25 公開操作唯一 owner；四項靜態 RULE 皆通過 |
| MISVG／來源／追溯 | pass | 18 份來源／圖面／引用指紋、雙向需求關聯與派生索引一致 |
| Chromium | pass | 十八頁零畫布出界、零卡片出界、零文字重疊；與來源報告指紋相符 |
| ESLint／shell／diff | pass | 瀏覽器檢查器 lint、test.sh 語法及工作／原暫存 diff whitespace |
| 應用／完整 E2E／覆蓋率 | not-run | 業務行為未修改；不得以工具測試取代應用驗收 |
| 獨立審查、效能與恢復演練 | not-run | 未委派第二模型或接手者；既有 OPEN 保留 |
| 新遠端 CI | not-run | 只修改本機 workflow 與 test.sh，未提交／推送 |

四項可執行規則檢查專案依賴、內層框架依賴、Gateway proxy／JWT 邊界及功能／UML 追溯。它們會阻擋跨服務／反向相依、內層 DB／HTTP 框架、遺失 JWT policy、internal proxy、未映射／重複操作、缺少功能邊界與失效測試參照。另六項資料、授權、錯誤、品質、變更及交付規則標示 review-required，配合既有行為測試及格式／lint／型別／建置／95%-90% 覆蓋率／audit／OpenAPI／Docker gates，不由靜態 checker 假稱驗收通過。

初次測試 fixture 缺少參照檔案、以及修改自閉合 XML 的方法無效，均已修正，最終 88 項通過。中途新增轉移編號後，瀏覽器另抓到一處狀態圖數字重疊；已修正位置並加入回歸案例，原失敗 JSON 仍保留於本次原始產物。此處不隱藏中間失敗，也不把它們當成最終未解決問題。

精確版本、檔案指紋、環境、命令、起迄時間及結果見 record.json。原始輸出與十八份截圖凍結於忽略的 artifacts/living-docs/REC-DOCS-20261108-002/，交接時另行提供；不提交測試產物。001 紀錄原樣保留；本紀錄是新範圍的補充，不是對舊紀錄的覆寫或人工核准。
