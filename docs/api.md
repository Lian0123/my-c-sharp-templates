# API 與錯誤規範

完整規格由執行中的 `/openapi/{auth|account|message}/v1.json` 產生，統一 Swagger 入口為 `/docs`；匯出的版本位於 `docs/openapi`。

| 路由 | 行為 |
|---|---|
| `POST /api/v1/auth/register` | 註冊、排入驗證信，202 |
| `POST /api/v1/auth/verify` | 消耗一次性驗證連結 |
| `POST /api/v1/auth/login` | JWT、使用者資訊與 HttpOnly Refresh Cookie |
| `POST /api/v1/auth/refresh` | 需 Cookie 與 `X-CSRF-Token`，單次輪替 |
| `POST /api/v1/auth/logout` | JWT、Cookie 與 CSRF，撤銷登入 family |
| `POST /api/v1/auth/resend-verification` | 重寄驗證信 |
| `POST /api/v1/auth/forgot-password`、`/reset` | 密碼重設、撤銷既有登入 |
| `/api/v1/auth/admin/users` | 管理員帳號與角色管理 |
| `/api/v1/accounts/me` | 個人資料查詢、更新 |
| `GET /api/v1/accounts/` | 搜尋公開會員資料 |
| `/api/v1/chat/rooms`、`/direct` | 群組／一對一對話 |
| `/api/v1/chat/rooms/{id}/messages` | 訊息寫入、歷史／補拉 |
| `/api/v1/chat/rooms/{id}/members`、`/owner` | 成員權限、退出與擁有權移轉 |
| `/api/v1/chat/rooms/{id}/read` | 單調已讀游標 |
| `/api/v1/chat/rooms/{id}/attachments` | 上傳一個附件 |
| `/api/v1/chat/attachments/{id}` | 經授權下載 |
| `/api/v1/chat/admin/*` | 聊天室、訊息、附件及稽核管理 |
| `/api/v1/system/status` | 管理員檢查服務就緒狀態 |
| `/hubs/chat` | WebSocket；`changed` 通知，`Heartbeat` 維持在線狀態 |

## 錯誤碼

`errorCode` 為字串，前三位 HTTP 狀態加四位序號，不含加號。共用 `0001–0999`、Auth `1000–1999`、Account `2000–2999`、Message `3000–3999`、Gateway `4000–4999`；同一碼只有一個定義。權威來源是 `src/Shared/Contracts/Errors.cs`，執行中的完整目錄為 `/api/v1/errors`。

```json
{
  "type": "about:blank",
  "title": "輸入資料不正確",
  "status": 400,
  "detail": "輸入資料不正確",
  "instance": "/api/v1/auth/register",
  "errorCode": "4000001",
  "traceId": "0123456789abcdef0123456789abcdef",
  "source": "Auth",
  "errors": { "Email": ["Email 格式不正確"] }
}
```

常用碼：`4010001` 需重新登入、`4030001` 無權限、`4091001` Email 重複、`4091002` 最後管理員保護、`4043001` 聊天室不存在或不可存取、`4093001` 附件不可綁定、`4130001` 檔案過大、`4290001` 限流、`5000001` 未預期錯誤、`5030001` 相依服務無法驗證／使用。

## 邊界與預設

密碼 12–128 個字元；顯示名稱 1–50、介紹最多 500、群組名稱最多 100、訊息最多 4000 個 Unicode code point。每群組最多 200 人；每則最多五個附件，每檔 20×1024×1024 bytes；允許 JPEG／PNG／WebP／PDF／UTF-8 純文字。圖片最多 8192 像素單邊與 1600 萬像素總量。

歷史訊息預設 50 筆，`limit` 為 1–100；`before` 與 `after` 不可同時提供。管理清單最多回傳指定的 100 筆，CMS 標示載入範圍。管理原因為 5–1000 字元。Access Token 五分鐘、Refresh Token 七天絕對期限、驗證信 24 小時、重設連結 15 分鐘。登入每來源每分鐘 30 次、帳號五次錯誤鎖定 15 分鐘；Gateway 預設每來源每分鐘 300 個 API／Hub 請求。
