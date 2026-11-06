# 架構決策

## 資料所有權

Auth 是帳號身分、角色、啟用狀態與登入 Session 的權威；Account 管理公開個人資料；Message 管理聊天室與附件中繼資料。其他服務只保存工作所需的投影。每個資料服務使用獨立 Server、帳密、Volume 與資料網路。

註冊先提交 Auth 資料與 `auth.identity.changed.v1` Outbox，回傳 202。Account 建立公開資料並發布 `account.profile.changed.v1`；Message 消費身分與公開資料事件。尚未初始化的 Account `/me` 回傳 202／`Retry-After: 2`；前端自動重試。資料投影與快取不作為登入授權依據。

## 可靠同步

每個服務的業務異動與 Outbox 在同一個 PostgreSQL Transaction 提交。Publisher 使用 `FOR UPDATE SKIP LOCKED`、持久化訊息、mandatory 與 Publisher Confirms，確認成功後才標記已發布。啟動時先建立所有必要訂閱，避免先啟動 Producer 導致其他服務漏接初始事件。

Consumer 使用手動 ACK；Inbox 與投影異動同交易提交。事件及 Aggregate advisory lock 防止跨副本重複或亂序競態；資料版本拒絕舊事件覆寫新資料。處理失敗先送入延遲重試佇列，確認後 ACK 原訊息，最多五次後進入死信。

主佇列與重試佇列使用 quorum／at-least-once dead lettering。反覆崩潰而超過主佇列 delivery limit 的訊息也轉至死信；死信佇列停用 delivery limit，維運預覽不會導致訊息被丟棄。投遞語意為至少一次，並非跨資料庫 exactly-once。

## 即時撤銷與聊天

Gateway 驗證 RS256 JWT；服務再次驗證 JWT，並向 Auth 查驗 Session、安全版本、有效期、Email 驗證及啟用狀態。有效結果不快取，Redis 只保存已完成撤銷的 Session。Auth 無法驗證時回傳 503；負向快取故障則回源 PostgreSQL。

撤銷提交後的新操作與推送會被拒絕；已開始處理的請求不追溯回滾。Auth 同步通知 Message 關閉連線；節點另有持續驗證。即使 RabbitMQ 延遲，授權也不等待投影更新。閒置連線遇到故障時會在連線檢查週期內關閉，推送前仍立即查驗 Auth。

訊息透過 REST 寫入，以 `(roomId, senderId, clientMessageId)` 唯一約束與內容雜湊保證重送冪等。房間列鎖分配單調序號，已讀位置不得倒退。SignalR 使用 WebSocket 與 Message Redis backplane；Gateway 設定 session affinity。客戶端以訊息 ID 去重、游標補拉與定期同步處理遺漏通知。

## 檔案與安全

S3 僅由 Message 存取。上傳先建立待完成記錄，再寫入物件，完成後才能綁定訊息；未綁定超過 24 小時清理。副檔名、MIME、圖片解碼／尺寸、PDF 特徵與 UTF-8 均檢查。檔案下載每次驗證登入及房間權限，不發出可繞過撤銷的公開下載網址。

密碼使用 ASP.NET Core Identity 雜湊；Refresh Token／驗證連結僅保存 SHA-256 雜湊。郵件佇列內容使用 Data Protection 加密，寄送後清除內容，金鑰持久化於 Auth 專屬 Volume。Refresh Token 單次輪替、重用撤銷整個 family；登出序列化處理並撤銷該 family，防止與輪替競態。
