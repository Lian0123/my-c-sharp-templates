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
| [09 · 工程交付控制與維護契約](09-agent-maintenance.misvg.svg) | 六階段流程、REQ／AC／ADR、風險、版本證據、OPEN 與交接查詢 |
| [10 · Auth／Account 功能契約](10-feature-identity.misvg.svg) | 註冊、驗證、登入、重設、Refresh、撤銷、管理、個人資料與搜尋 |
| [11 · Message 功能契約](11-feature-chat.misvg.svg) | 房間、成員、歷史、送訊、已讀、上傳、下載／審核及即時通知 |
| [12 · 平台／前端功能契約](12-feature-platform.misvg.svg) | Gateway、事件、郵件、清理、三個 UI、維運及文件工具 |
| [13 · UML 使用案例](13-use-cases.misvg.svg) | 訪客／會員／Admin、系統邊界、使用案例橢圓與功能對應 |
| [14 · UML 活動圖](14-registration-activity.misvg.svg) | 註冊輸入、判斷、交易、獨立背景工作、失敗重試與初始化完成 |
| [15 · UML Session 狀態圖](15-session-state.misvg.svg) | 單一 Session 有效、撤銷、過期及有 guard 的轉移；新 ID 不復活舊 ID |
| [16 · UML 部署圖](16-deployment.misvg.svg) | 執行環境、artifact、內外網路、掛載、Volume、依賴與啟動條件 |
| [17 · 開發規則與任務契約](17-development-rules.misvg.svg) | 四項強制靜態規則、六項審查規則、TASK-CONTRACT 與實際檢查方式 |

類別／ERD 採「實體目錄＋逐條關聯視圖」，相同節點 ID 表示同一物件；關係逐條呈現，避免線條交叉隱藏多重性或箭頭方向。時序圖使用參與者、生命線、順序編號及有向訊息。實線 `fk` 與虛線 `logical` 刻意區別實體外鍵與程式維護的參照；跨服務事件不是跨資料庫 FK。

目前程式只有 Message 的三組 RoomId 設定實體 FK。Auth 的 Session／Challenge UserId、Message 的 SenderId／OwnerId／MessageId 等屬於邏輯參照。事件 Envelope 沒有獨立 Source 欄位、Auth 不消費 ProfileChanged、附件狀態沒有獨立 enum；圖中皆依實作標示。

## 從需求到交付

依使用者提供的「從 Vibe Coding 到工程交付」文章，09 頁作為流程控制入口，00–08 保留架構與資料關聯；10–12 補齊功能／工作拆分，13–17 補充 UML 視圖與開發規則。六階段可反覆迭代，依風險調整工作量，不要求每個小改動重走整套部署驗收。

| 階段 | 留下的內容 | 推進判據 |
|---|---|---|
| 需求制定 | REQ、範圍、角色、已知／未知與限制 | 目標可觀察；未知列 OPEN，不能以猜測填成需求 |
| 設計分析 | ADR、UML、資料權責、取捨與替代方案 | 理由、代價、重評條件可查；未做的 POC 明列 |
| 驗收定義 | AC、Given／When／Then、測試與預期依據 | 先定義完成方式，不能僅重述目前實作或覆蓋率 |
| 小步開發 | 有界、可回復的變更與影響清單 | 相關檢查通過；契約／授權／資料變更重評影響 |
| 可靠度驗證 | 正常、異常、邊界、故障與部署證據 | 依版本記錄 pass／fail／skipped／not-run |
| 交付與交接 | 當前文件、唯增紀錄、運行與故障入口 | 接手者能查到前置條件、成功判據與維護方式 |

各 SVG 顯示文件編號、生命週期、核准狀態、維護角色、具名負責人、審查日期與適用基準。目前維護角色待具名、文件核准為 `not-recorded`；`current` 只表示目前維護的描述，不代表人工核准。REQ 的 `confirmed` 依使用者明確計畫，ADR 的 `observed-retrospective` 表示依現況補記，不能冒認開發前會議紀錄。

09 頁收斂為八組主要 REQ、對應 AC、四個 ADR 與兩項 OPEN。這是主要流程的追溯基線，並非宣稱窮盡所有功能、非功能需求或安全情境。效能／資源目標、RPO／RTO 與獨立交接演練保留待確認。

```sh
# 從需求找到驗收、設計、圖頁、實作、測試與證據狀態。
python3 scripts/living_docs.py catalog --requirement REQ-AUTH-001
# 所有內容只從 SVG 的 m:source 派生，勿手改 JSON。
python3 scripts/living_docs.py catalog --write
```

[catalog.json](catalog.json) 檢查雙向圖頁關聯、決策、程式／測試宣告及必要控制欄位。宣告參照使用文字模式作輔助檢查，不取代 MCP 圖譜、編譯器或人工核對。**參照覆蓋**只證明需求有映射；**程式覆蓋率**只描述執行到的程式範圍；**驗收結果**還需核對斷言、實際環境、資料與限定版本的輸出，三者不可互相取代。

## 當前文件與歷史紀錄

`docs/living/` 隨實作更新；[docs/records](../records/README.md) 保存當時的版本、環境、命令與原始證據。先前十頁文件工具驗證見 [REC-DOCS-20261108-001](../records/REC-DOCS-20261108-001/record.json)。既有應用 CI `46fb1e2` 僅是該 commit 的歷史證據，不能自動升格為本次應用驗收。封存以清單雜湊及 Git 首次提交快照比對；更正必須新增紀錄，不能覆寫舊檔或只重算雜湊。首次提交前的紀錄明示 `new-uncommitted-record`，不冒稱已有 Git 不可變基線。

功能拆分／UML／規則擴充的本次交付另見 [REC-DOCS-20261108-002](../records/REC-DOCS-20261108-002/record.json)；001 僅適用先前十頁版本，保留原紀錄。

交接可先回答 09 頁 Q-H01–Q-H05：依賴與資料權責、啟動成功、MQ 故障、需求對應測試、人工維運入口。這些是文件查詢題；未參與者／獨立模型實際演練仍為 `not-run`，不能用同一作者自查代替。

## 功能如何拆分與落實

26 個 FEAT 是可獨立說明、驗證及回復的責任契約，包含輸入、輸出、角色／權限、資料交易、同步／副作用、錯誤重試、邊界、不做範圍、修改範圍、程式／測試、完成條件與回復方式。三個業務 Application 介面的 25 個操作各有唯一 owner；新增方法但沒有契約、重複歸屬、測試名稱失效或索引過期會失敗。

目前 AuthService 與 ChatService 仍各自實作多個操作；這次落實的是功能與任務邊界、既有服務／分層的強制檢查，未將每個 FEAT 改成獨立 class 或新服務。背景寄信、事件、物件儲存、連線登記與通知原本已有個別元件。需要再拆實作類別時，以實際相依及回歸證據決定，不以圖面數量製造抽象。

```sh
python3 scripts/development_rules.py show --feature FEAT-CHAT-SEND
python3 scripts/development_rules.py index
python3 scripts/development_rules.py check --report artifacts/living-docs/development-rules.json
```

[features.json](features.json) 是第二個派生查詢索引，仍只讀 SVG 的權威來源。C# 契約擷取支援目前明確命名的 public interface／Task 方法；遇到新語法會要求審查，不冒稱完整 C# 語意分析。前端測試可用 `path#test:精確測試名稱`，輔助檢查情境名稱仍存在；同樣不能證明斷言充分或本次已執行。

每次任務依 17 頁 TASK-CONTRACT 留下目標 FEAT／REQ／AC／ADR、允許修改與不做範圍、受影響 API／資料／事件／UI、獨立預期、風險檢查及回復方式。完成時記錄版本、結果與未執行項目；若變更超出原範圍，先重評影響並更新契約。

四項新靜態規則直接進入 CI 及 `scripts/test.sh`：專案依賴、內層框架依賴、Gateway proxy/JWT 邊界、功能／UML 追溯。資料交易、授權、錯誤、品質、變更與交付等六項規則標示 `review-required`，須配合既有單元／整合／E2E、格式、lint、型別／建置、95%／90% 覆蓋率、audit、OpenAPI 一致性與 Docker gate；靜態通過不代表這六項行為驗收也通過。

| 變更風險 | 最低相關檢查 |
|---|---|
| 文件／靜態圖面 | 來源與追溯、Tooling 回歸、瀏覽器排版及人工畫面檢視 |
| 單服務行為／前端流程 | 上述受影響文件＋單元／型別／建置、相關整合與前端測試 |
| 契約／授權／共用模組／遷移 | 影響服務回歸、邊界／錯誤／故障與相容性驗證；必要時完整 E2E |
| 部署／恢復策略 | 隔離環境啟動、故障、回退／還原與交接演練，記錄資料及成功判據 |

## Agent 如何更新

1. 先遵循根目錄 [AGENTS.md](../../AGENTS.md)，以 MCP 圖譜找出實際類別、呼叫與依賴，再核對來源。不要將計畫當成已實作功能。
2. 核對各 SVG「來源」所列程式碼。`a:provenance` 保存這些檔案的 SHA-256；來源變更時檢查會回報 `E_SOURCE_STALE`，要求重新審查，而非默默刷新時間戳。
3. 擷取權威 Markdown 到暫存檔，修改內容與關係，使用原始完整檔案雜湊更新。更新工具會保留 doc-id、遞增 revision、重新生成 bindings／digest／圖面，並以合作式檔案鎖及原子替換防止部分寫入。
4. 更新相關 REQ／AC／ADR／OPEN，重新生成索引。執行結構／內容／追溯檢查、工具回歸與實際 SVG 畫面檢視，再保存限定範圍的交付紀錄。依 AGENTS 規則，測試原始輸出、截圖及暫存產物留在忽略的 `artifacts/`；`docs/records/` 僅保存整理後的交付摘要、版本與證據指紋，不提交測試產物。

從專案根目錄執行：

```sh
doc_path=docs/living/04-message-data.misvg.svg
doc_fingerprint="$(python3 scripts/living_docs.py fingerprint "$doc_path")"
doc_source="$(mktemp "${TMPDIR:-/tmp}/relay-doc.XXXXXX")"
python3 scripts/living_docs.py extract "$doc_path" > "$doc_source"
# 使用文字編輯器修改 doc_source 指向的暫存檔，核對實作後再更新。
python3 scripts/living_docs.py update "$doc_path" \
  --source "$doc_source" --expected-sha256 "$doc_fingerprint" --reviewed-code
python3 scripts/living_docs.py catalog --write
python3 scripts/development_rules.py index
python3 scripts/living_docs.py check --report artifacts/living-docs/source-report.json
python3 scripts/development_rules.py check
python3 -m unittest discover -s tests/Tooling -p 'test_*.py'
node src/Web/scripts/check-living-docs.mjs
python3 scripts/living_docs.py records-check
```

最後一個指令使用既有 `src/Web/node_modules` 的 Playwright Chromium；先執行 `npm --prefix src/Web ci` 與安裝 Chromium。CI 安裝 Noto CJK 字型後執行同一檢查。無需啟動資料庫或 Docker。只核對程式來源、Markdown 與靜態 SVG，不執行文件內容中的程式或連結。

更新工具使用 POSIX 檔案鎖，支援 macOS／Linux；Windows 可在 WSL 執行。SVG 本身可由一般 SVG 檢視器閱讀，不依賴此更新工具。

只有已讀取並核對引用程式後才能使用 `--reviewed-code`；它不是自動推論架構正確性的保證。若文字無需變更、僅程式實作雜湊改變，仍必須審查後更新同一文件。未改變任何內容或呈現時更新為 no-op，不增加 revision。遇到不認識的擴充資料，普通更新以 `E_EXTENSION_EDIT` 停止並保留原檔。

## 受控 Markdown 編寫格式

內嵌來源是合法 CommonMark 0.31.2 的受控子集，不使用 GFM 表格、Mermaid、HTML 排版、程式執行或 include。來源純文字即明確宣告每個節點與關係；產生器將資料排成靜態 SVG，沒有將 code block 當程式執行。

```text
# 文件標題

視圖：cards
文件編號：DOC-10
文件狀態：draft
核准狀態：not-recorded
維護角色：技術維護角色（待具名確認）
具名負責人：unassigned
適用基準：referenced-source-sha256
最後審查：2026-11-08
關聯需求：REQ-DOC-001
關聯決策：ADR-DOC-001
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

`cards` 用於元件／套件／類別／ERD 與功能規則目錄；`sequence` 用於時序；`usecase` 使用原生人物、系統框與橢圓；`activity` 使用初始／結束、圓角活動及有 guard 的判斷；`state` 描述一個實例的狀態與轉移；`deployment` 使用立體節點、artifact 及網路／掛載欄位。關係類型為 dependency、realization、inheritance、association、logical、fk、event、call、return、transition、composition。箭頭與線型含意必須在該頁來源寫明；不可只靠顏色或位置暗示新關係。節點 ID、型別、端點、標籤、欄位、準則與程式參照都會出現在可搜尋的圖面文字中。

受控 UML 子集：使用案例只支援 actor→usecase association，案例以「功能」連結 FEAT；不假造 include／extend 或完整 UML metamodel。活動／狀態需一個 initial，transition 的 trigger／guard／effect 在關係目錄逐條標示；活動 decision 至少兩個有 `[條件]` 的分支。初始、結束及判斷節點不能附未呈現的欄位。左側導線呈現轉移拓撲，下面的來源／目標／條件目錄補足標籤；這些受控視圖不宣稱涵蓋全部 UML 圖種或交換格式。

此工具不支援一般 CommonMark 排版或完整 MISVG 幾何語法。讀取器仍能保留／擷取原始來源；若要用本專案產生器編輯其他 Markdown 語法，會回報 `E_UNSUPPORTED`，不會刪字或悄悄改成另一種方言。新文件使用 `create ... --source ... --reviewed-code`，產生新的 UUIDv4；移動既有文件則保留其 ID。

集合檢查另要求上述控制欄位，並同步更新 09 頁 REQ 的「圖頁」反向連結。新增 REQ／ADR 時沿用 09 的欄位格式與穩定編號；變更既有語意時更新記錄，不重新編號掩蓋歷史。`confirmed` 文件核准需具名負責人及已封存、可歸屬的核准證據；工具不能代替人工確認。

## 驗證範圍與限制

驗證分開回報 structure、source-binding、static-profile、content-fidelity、visual-review。來源雜湊通過不代表圖面正確、簽章有效或作者可信。

- Python 檢查 UTF-8、固定 namespace／wire version、核心欄位、UUIDv4、revision、SHA-256、唯一 ID、行號、閉合 SVG 子集、靜態幾何、程式引用及來源衍生圖面。它會重新產生預期 view 比對，不只檢查 digest。
- 專案 SVG 只使用 g、text、tspan、rect、line、polygon、polyline、circle、ellipse，無 script、style、foreignObject、image、href、外部字型或網路資源。其他合法 MISVG 幾何（path）在本工具回報 unsupported，不冒稱格式無效。
- 回歸測試涵蓋 Unicode／CDATA／CRLF／BOM、來源與圖面竄改、錯誤引用、危險元素、DTD、資源上限、未知擴充、編輯衝突與原子寫入失敗。這些是專案適用案例，不宣稱完成所有一般編輯器的 Annex B 能力。
- Chromium 實際渲染所有 SVG，檢查文字超出畫布／節點卡片及文字間重疊，輸出 PNG 與 visual-report.json。畫面另需檢視字形、閱讀順序與對比；跨獨立 SVG 引擎的互通性認證未執行。
- 上限：8 MiB 檔案、1 MiB 來源、64 層 XML、50,000 節點、65,536 字元屬性／非來源文字、讀取檢查 10 秒；單頁最多 20 節點、40 關係。畫布遵循 MISVG 的 16,384 邊長及 16,777,216 面積上限；超限要求拆頁，回報 E_LIMIT／unsupported。

規範 XSD 只是 metadata 輔助 schema；本工具使用程式化檢查，並未宣稱通過完整 MISVG、UML、SVG 引擎或無障礙認證。文件格式目前仍採用上游草案的 example.org namespace，沒有將其當作可連線服務。
