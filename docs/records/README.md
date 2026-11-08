# 工程交付紀錄

[當前 Living Document](../living/README.md) 隨實作修改；本目錄保留限定版本的驗證紀錄，不是另一份現行規格。日期較新不表示自動取代既有有效規格。

| 紀錄 | 範圍 |
|---|---|
| [REC-DOCS-20261108-001](REC-DOCS-20261108-001/record.json) | 六階段工程文件、追溯／封存工具、十份 SVG 的來源與瀏覽器排版驗證 |
| [REC-DOCS-20261108-002](REC-DOCS-20261108-002/record.json) | 功能契約、原生 UML 視圖、可執行開發規則及十八份 SVG 的本次驗證；不覆寫 001 |

每個紀錄包含 `record.json`、經整理的 `evidence/` 交付摘要，以及 `manifest.<sha256>.json`。記錄基準 commit、工作樹檔案快照、環境、命令、時間、範圍及 pass／fail／skipped／not-run；`pass` 必須附成功 exit code 與保存的證據摘要。紀錄中的應用程式歷史 CI 只能支持其原 commit；參照完整度及程式覆蓋率均不能取代需求驗收。

遵守根 AGENTS 不提交測試產物的規則：測試原始輸出、JSON 測試報告及截圖留在忽略的 `artifacts/` 或 CI artifacts，紀錄保存路徑／URL 與 SHA-256。本機產物不保證永久可用；移交時須連同產物交付或另存團隊的證據儲存，只有摘要與雜湊不能重建原始輸出。此處的封印保護已保存的交付紀錄，不宣稱原始產物已永久封存。

完成檢查後準備 JSON 與證據，從專案根目錄封存：

```sh
python3 scripts/living_docs.py archive --record /tmp/record.json \
  --evidence verification-summary.md=/tmp/verification-summary.md
python3 scripts/living_docs.py records-check
python3 scripts/living_docs.py check
```

`record.json` 至少提供 `recordId`（`REC-` 開頭大寫編號）、`kind: verification`、`scope`、`applicability`、`checks`（command／status／exitCode／evidence／reason）及 `corrects`。另應保留實際起迄時間、工具版本、檔案雜湊與未驗證事項。不要將 Token、Cookie、密碼、環境機密或完整聊天內容複製到證據中。

封存工具拒絕覆寫。清單封印與內容雜湊檢查可發現變動；完整 Git 歷史再與該目錄第一次提交快照比對，防止重算清單後覆寫，也檢查整個舊紀錄目錄被刪除。CI 以 `fetch-depth: 0` 取得歷史；淺層 checkout 會拒絕不可變性檢查。首次提交前回報 `new-uncommitted-record`，這時僅具有內容完整性檢查。這不是數位簽章或防止 Git 歷史被改寫的保證。

更正需新增另一個紀錄編號，於 `corrects` 列出原紀錄；說明修正原因與新的適用範圍。保留原紀錄與失敗／未執行結果。人工核准或獨立交接必須有實際可歸屬證據，不能由工具自行宣稱。
