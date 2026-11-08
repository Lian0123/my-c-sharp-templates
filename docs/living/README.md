# Agent Living Document · Relay

這是 MicroserviceStarter 的可維護架構文件。每份 SVG 都同時包含原生靜態圖面、完整繁體中文 Markdown、來源行號綁定與 SHA-256。**文件內容的唯一權威是 SVG metadata 的 `m:source`；程式碼是實作事實的依據。** 不另維護第二份權威 Markdown，也不以圖片或 OCR 回寫來源。

依據 [Markdown-in-SVG](https://github.com/Lian0123/markdown-in-svg) 的 **MISVG-SPEC-0001 revision 0.1.1 / Draft 02**，wire version 為 **0.1**、profile 為 **static**。規則固定於 [c7c0d96](https://github.com/Lian0123/markdown-in-svg/blob/c7c0d96aa398d650c6bea5588e5d060bc6d60da5/MISVG-0.1.en.md)，英文版為規範權威；這套專案文件使用繁體中文。

## 閱讀入口

| 文件 | UML／關聯內容 |
|---|---|
| [00 · 系統全景](00-system-overview.misvg.svg) | 元件、部署資源、三組 PostgreSQL／Redis、路由與資料所有權 |
| [01 · 分層與類別](01-layer-and-class.misvg.svg) | API／Application／Domain／Infrastructure、介面實現、繼承與依賴 |
| [02 · Auth 資料模型](02-auth-data.misvg.svg) | User、LoginSession、EmailChallenge、MailJob、雜湊與技術表 |
| [03 · Account 與投影](03-account-projections.misvg.svg) | Auth → Account → Message 的 ID／版本對應、快取及初始化 |
| [04 · Message ERD](04-message-data.misvg.svg) | Room、Membership、ChatMessage、Attachment、ChatUser、唯一鍵與多重性 |
| [05 · 事件同步時序](05-event-synchronization.misvg.svg) | Outbox／Inbox、Confirm／ACK、版本、防重、有限重試與死信 |
| [06 · 登入與撤銷時序](06-auth-revocation.misvg.svg) | JWT、Cookie／CSRF、權威 Session 查驗與直接撤銷連線 |
| [07 · 聊天時序](07-chat-sequence.misvg.svg) | REST 寫入、RabbitMQ、SignalR、收件 Session、游標與已讀 |
| [08 · 附件生命週期](08-attachment-lifecycle.misvg.svg) | Pending／Ready／Bound／Removed、Garage、下載授權與逾期清理 |
| [09 · Agent 維護契約](09-agent-maintenance.misvg.svg) | 變更影響地圖、更新程序、品質門檻、信任邊界與限制 |

類別／ERD 採「實體目錄＋逐條關聯視圖」，相同節點 ID 表示同一物件；關係逐條呈現，避免線條交叉隱藏多重性或箭頭方向。時序圖使用參與者、生命線、順序編號及有向訊息。實線 `fk` 與虛線 `logical` 刻意區別實體外鍵與程式維護的參照；跨服務事件不是跨資料庫 FK。

目前程式只有 Message 的三組 RoomId 設定實體 FK。Auth 的 Session／Challenge UserId、Message 的 SenderId／OwnerId／MessageId 等屬於邏輯參照。事件 Envelope 沒有獨立 Source 欄位、Auth 不消費 ProfileChanged、附件狀態沒有獨立 enum；圖中皆依實作標示。

## Agent 如何更新

1. 先遵循根目錄 [AGENTS.md](../../AGENTS.md)，以 MCP 圖譜找出實際類別、呼叫與依賴，再核對來源。不要將計畫當成已實作功能。
2. 核對各 SVG「來源」所列程式碼。`a:provenance` 保存這些檔案的 SHA-256；來源變更時檢查會回報 `E_SOURCE_STALE`，要求重新審查，而非默默刷新時間戳。
3. 擷取權威 Markdown 到暫存檔，修改內容與關係，使用原始完整檔案雜湊更新。更新工具會保留 doc-id、遞增 revision、重新生成 bindings／digest／圖面，並以合作式檔案鎖及原子替換防止部分寫入。
4. 執行結構／內容檢查、工具回歸測試與實際 SVG 畫面檢視；最後提交 SVG 與必要工具變更。截圖、擷取 Markdown 與驗收 JSON 都是衍生產物，留在 `artifacts/` 或暫存目錄。

從專案根目錄執行：

```sh
doc_path=docs/living/04-message-data.misvg.svg
doc_fingerprint="$(python3 scripts/living_docs.py fingerprint "$doc_path")"
doc_source="$(mktemp "${TMPDIR:-/tmp}/relay-doc.XXXXXX")"
python3 scripts/living_docs.py extract "$doc_path" > "$doc_source"
# 使用文字編輯器修改 doc_source 指向的暫存檔，核對實作後再更新。
python3 scripts/living_docs.py update "$doc_path" \
  --source "$doc_source" --expected-sha256 "$doc_fingerprint" --reviewed-code
python3 scripts/living_docs.py check --report artifacts/living-docs/source-report.json
python3 -m unittest discover -s tests/Tooling -p 'test_living_docs.py'
node src/Web/scripts/check-living-docs.mjs
```

最後一個指令使用既有 `src/Web/node_modules` 的 Playwright Chromium；先執行 `npm --prefix src/Web ci` 與安裝 Chromium。CI 安裝 Noto CJK 字型後執行同一檢查。無需啟動資料庫或 Docker。只核對程式來源、Markdown 與靜態 SVG，不執行文件內容中的程式或連結。

更新工具使用 POSIX 檔案鎖，支援 macOS／Linux；Windows 可在 WSL 執行。SVG 本身可由一般 SVG 檢視器閱讀，不依賴此更新工具。

只有已讀取並核對引用程式後才能使用 `--reviewed-code`；它不是自動推論架構正確性的保證。若文字無需變更、僅程式實作雜湊改變，仍必須審查後更新同一文件。未改變任何內容或呈現時更新為 no-op，不增加 revision。遇到不認識的擴充資料，普通更新以 `E_EXTENSION_EDIT` 停止並保留原檔。

## 受控 Markdown 編寫格式

內嵌來源是合法 CommonMark 0.31.2 的受控子集，不使用 GFM 表格、Mermaid、HTML 排版、程式執行或 include。來源純文字即明確宣告每個節點與關係；產生器將資料排成靜態 SVG，沒有將 code block 當程式執行。

```text
# 文件標題

視圖：cards
範圍：描述這份圖的邊界。

## 節點

### sender | 發送者

- 欄位或職責。

### receiver | 接收者

- 欄位或職責。

## 關係

- event | sender | receiver | 事件方向與意義。

## 準則

- 重要不變條件與限制。

## 來源

- src/Shared/Contracts/IntegrationEvents.cs
```

`cards` 用於元件、類別、資料模型、活動與狀態；`sequence` 用於時序。關係類型為 dependency、realization、inheritance、association、logical、fk、event、call、return、transition、composition。箭頭與線型含意必須在該頁來源寫明；不可只靠顏色或位置暗示新關係。節點 ID、型別、端點、標籤、欄位、準則與程式參照都會出現在可搜尋的圖面文字中。

此工具不支援一般 CommonMark 排版或完整 MISVG 幾何語法。讀取器仍能保留／擷取原始來源；若要用本專案產生器編輯其他 Markdown 語法，會回報 `E_UNSUPPORTED`，不會刪字或悄悄改成另一種方言。新文件使用 `create ... --source ... --reviewed-code`，產生新的 UUIDv4；移動既有文件則保留其 ID。

## 驗證範圍與限制

驗證分開回報 structure、source-binding、static-profile、content-fidelity、visual-review。來源雜湊通過不代表圖面正確、簽章有效或作者可信。

- Python 檢查 UTF-8、固定 namespace／wire version、核心欄位、UUIDv4、revision、SHA-256、唯一 ID、行號、閉合 SVG 子集、靜態幾何、程式引用及來源衍生圖面。它會重新產生預期 view 比對，不只檢查 digest。
- 專案 SVG 只使用 g、text、tspan、rect、line、polygon、polyline，無 script、style、foreignObject、image、href、外部字型或網路資源。其他合法 MISVG 幾何（path／circle／ellipse）在本工具回報 unsupported，不冒稱格式無效。
- 回歸測試涵蓋 Unicode／CDATA／CRLF／BOM、來源與圖面竄改、錯誤引用、危險元素、DTD、資源上限、未知擴充、編輯衝突與原子寫入失敗。這些是專案適用案例，不宣稱完成所有一般編輯器的 Annex B 能力。
- Chromium 實際渲染所有 SVG，檢查文字出界及文字間重疊，輸出 PNG 與 visual-report.json。畫面另需檢視字形、閱讀順序與對比；跨獨立 SVG 引擎的互通性認證未執行。
- 上限：8 MiB 檔案、1 MiB 來源、64 層 XML、50,000 節點、65,536 字元屬性／非來源文字、讀取檢查 10 秒；單頁最多 20 節點、40 關係。畫布遵循 MISVG 的 16,384 邊長及 16,777,216 面積上限；超限要求拆頁，回報 E_LIMIT／unsupported。

規範 XSD 只是 metadata 輔助 schema；本工具使用程式化檢查，並未宣稱通過完整 MISVG、UML、SVG 引擎或無障礙認證。文件格式目前仍採用上游草案的 example.org namespace，沒有將其當作可連線服務。
