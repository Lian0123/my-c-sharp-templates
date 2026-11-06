# 維運與故障處理

## 啟動、Migration 與設定

`docker compose up -d --build` 先執行三個獨立 Migration 工作，再啟動應用。修改資料模型後使用 `./scripts/generate-migrations.sh MigrationName`；不要以 `EnsureCreated` 取代 Migration。初始管理員只在帳號不存在時建立。

後端設定使用 ASP.NET Core 的 `__` 階層環境變數。資料庫／Redis／RabbitMQ／內部服務憑證與 S3 金鑰由 `.env` 提供。`Smtp__Host`、`Smtp__Port`、`Smtp__StartTls`、`Smtp__Username`、`Smtp__Password`、`Smtp__From` 可替換正式 SMTP；正式環境應啟用 STARTTLS。

JWT 私鑰僅掛載 Auth。輪替金鑰時同時替換私／公鑰並重啟四個 .NET 應用；目前為單一有效簽章金鑰。Data Protection 金鑰保存在 `auth-keys` Volume，遺失會使未寄送的加密郵件無法還原。

## 健康與故障

每個服務提供 `/health/live` 與 `/health/ready`，內網就緒檢查驗證自己的 PostgreSQL。CMS 管理員可查看三個服務的狀態。RabbitMQ／Redis／Garage 另有容器健康檢查；就緒不代表所有非必要相依都正常，需同時查看 `docker compose ps` 與結構化日誌。

| 狀況 | 行為與處理 |
|---|---|
| RabbitMQ 暫停 | 業務交易保留 Outbox，恢復後補送；即時通知可能延遲 |
| Auth 或其 PostgreSQL 不可用 | 受保護操作／推送停止，回傳 503 |
| Account Redis 故障或內容損毀 | 回源 PostgreSQL；不以快取判斷授權 |
| Message Redis 故障 | 在線／即時能力不可用；持久化訊息仍可從 API 讀取，恢復後重連補齊 |
| Garage 不可用 | 附件操作回傳 503；不影響既有文字資料 |
| SMTP 不可用 | 郵件工作保留，恢復後重試，不丟棄驗證工作 |

`docker compose logs -f auth account message gateway` 依 `traceId` 關聯 HTTP 與事件。Serilog 不輸出 Cookie、Token、密碼或請求內文；Nginx 日誌只記錄不含 query string 的路徑。容器日誌最多 5×10 MB，正式集中式日誌收集由部署環境配置。

## 死信預覽與重送

```sh
docker compose -f docker-compose.yml -f docker-compose.tools.yml run --rm --build ops list message 10
docker compose -f docker-compose.yml -f docker-compose.tools.yml run --rm ops replay message 10
# Account 使用 account；Auth 僅發布身分事件，沒有業務事件訂閱。
```

預覽只輸出事件識別／型別／重試次數，不輸出 payload，讀完重新排回佇列。重送保留原事件 ID，重設重試次數，Publisher Confirm 成功且未被退回後才 ACK 原訊息。先修正 schema、資料或相依故障，再重送；Inbox 會忽略已完成事件。

## 一致性備份與還原

```sh
python3 scripts/backup.py backup
python3 scripts/backup.py restore artifacts/backups/指定快照目錄
```

備份會短暫停止寫入應用，取得三份 PostgreSQL dump，再停止 Garage／RabbitMQ 取得磁碟快照，並保存 Auth Data Protection 金鑰、JWT 金鑰及環境設定，最後重新啟動。快照附 SHA-256 清單，目錄僅限擁有者存取，包含機密資料。

**還原會覆蓋目前專案資料**，先驗證專案與雜湊，還原所有相依狀態並清空三個服務的快取。請在維護時段執行，並保留還原前快照；還原途中失敗不會自動開放部分完成的應用。跨專案移轉及大規模線上備份不屬於此單機工具的用途。

## 測試資料隔離

`scripts/test.sh` 與 `scripts/test-e2e.sh` 預設使用 `microservice-starter-tests`，Gateway 18080、Mailpit 18025、RabbitMQ 管理介面 25672。原生 SDK 整合測試才使用額外 loopback 資料連線埠；一般啟動不公開這些埠。每次 C# 整合測試另建獨立資料庫及 RabbitMQ vhost，完成後清理自己建立的資料。
