import { test, expect, type WebSocketRoute } from '@playwright/test';
import fs from 'node:fs/promises';
import { admin, baseURL, emailLink, login, member, password } from './helpers';

test('會員可從網頁註冊、收信驗證、登入與更新個人資料', async ({ page, request }) => {
  const email = `e2e-ui-${crypto.randomUUID()}@example.test`;
  await page.goto('/auth/login'); await page.getByRole('tab', { name: '建立帳號' }).click();
  await page.getByLabel('電子郵件').fill(email); await page.getByLabel('顯示名稱').fill('網頁註冊會員'); await page.getByLabel('密碼', { exact: true }).fill(password);
  await page.getByRole('button', { name: /建立帳號/ }).click(); await expect(page.getByText(/請查看您的信箱/)).toBeVisible();
  await page.goto(await emailLink(request, email, '驗證您的 Email')); await page.getByRole('button', { name: /確認驗證/ }).click(); await expect(page.getByText('操作已完成，請重新登入')).toBeVisible();
  await login(page, { email, password }); await page.locator('.rail-avatar').click();
  await page.getByLabel('顯示名稱').fill('更新後的會員'); await page.getByLabel('自我介紹').fill('端對端驗證的個人資料'); await page.getByRole('button', { name: '儲存變更' }).click();
  await expect(page.getByText('您好，更新後的會員')).toBeVisible();
  await expect(page.getByRole('button', { name: '管理後台' })).toHaveCount(0);
});

test('雙會員透過 WebSocket 聊天、讀取附件、已讀並在重連後補齊訊息', async ({ browser }, info) => {
  test.setTimeout(180_000);
  const suffix = crypto.randomUUID().slice(0, 6); const first = await member('對話甲_' + suffix); const second = await member('對話乙_' + suffix);
  const aContext = await browser.newContext({ baseURL, timezoneId: 'Asia/Taipei' }); const bContext = await browser.newContext({ baseURL, timezoneId: 'Asia/Taipei' }); const a = await aContext.newPage(); const b = await bContext.newPage();
  let paused = false; let socket: WebSocketRoute | undefined;
  await b.routeWebSocket('**/hubs/chat*', ws => { if (paused) ws.close({ code: 4001, reason: 'test reconnect' }); else { socket = ws; ws.connectToServer(); } });
  await login(a, first); await login(b, second);
  await expect(b.getByText('即時連線正常')).toBeVisible();
  await a.getByRole('button', { name: '建立對話', exact: true }).click(); const create = a.getByRole('dialog'); const roomName = '跨服務群組_' + suffix;
  await create.getByLabel('群組名稱').fill(roomName); await create.getByLabel('邀請成員').click(); await create.getByLabel('邀請成員').fill(second.name);
  await a.locator('.ant-select-item-option-content').filter({ hasText: second.name }).click();
  await create.getByLabel('邀請成員').press('Escape');
  await create.getByRole('button', { name: '建立對話', exact: true }).click(); await expect(create).not.toBeVisible();
  await a.getByLabel('輸入訊息').fill('第一則即時訊息_' + suffix); await a.getByRole('button', { name: /傳\s*送/ }).click();
  await b.getByText(roomName, { exact: true }).click(); await expect(b.getByText('第一則即時訊息_' + suffix, { exact: true })).toBeVisible();
  await expect(a.locator('.read-status').last()).toContainText('已讀');
  const bytes = Buffer.from('私有附件與 Unicode 內容 😀');
  await a.getByLabel('選擇附件').setInputFiles({ name: '測試附件.txt', mimeType: 'text/plain', buffer: bytes });
  await expect(a.getByRole('button', { name: /傳\s*送/ })).toBeEnabled(); await a.getByRole('button', { name: /傳\s*送/ }).click();
  const download = b.waitForEvent('download'); await b.getByRole('button', { name: /測試附件\.txt/ }).click(); const file = await download;
  expect(file.suggestedFilename()).toBe('測試附件.txt'); const path = info.outputPath('download.txt'); await file.saveAs(path); expect(await fs.readFile(path)).toEqual(bytes);
  paused = true; socket!.close({ code: 4001, reason: 'test disconnect' });
  for (const text of ['離線期間第一則', '離線期間第二則']) { await a.getByLabel('輸入訊息').fill(text); await a.getByRole('button', { name: /傳\s*送/ }).click(); await expect(a.getByLabel('輸入訊息')).toHaveValue(''); }
  paused = false;
  await expect(b.getByText('即時連線正常')).toBeVisible(); await expect(b.getByText('離線期間第一則', { exact: true })).toBeVisible(); await expect(b.getByText('離線期間第二則', { exact: true })).toBeVisible();
  await a.screenshot({ path: '../../artifacts/chat-desktop.png', fullPage: true });
  await aContext.close(); await bContext.close();
});

test('管理員檢視狀態、管理資料與稽核，且保護最後一位管理員', async ({ page }) => {
  await login(page, admin); await page.getByRole('button', { name: '管理後台', exact: true }).click(); await expect(page.getByText('全部就緒')).toBeVisible();
  await page.mouse.move(900, 50); await expect(page.getByText('歡迎回來', { exact: true })).not.toBeVisible();
  await page.screenshot({ path: '../../artifacts/cms-desktop.png', fullPage: true });
  await page.getByRole('tab', { name: '帳號與權限' }).click(); const own = page.getByRole('row').filter({ hasText: admin.email });
  for (let i = 0; i < 10 && await own.count() === 0; i++) {
    const next = page.getByRole('button', { name: '下一頁', exact: true });
    if (!await next.isEnabled()) break;
    await next.click();
  }
  await own.getByRole('button', { name: '權限與狀態' }).click();
  const dialog = page.getByRole('dialog'); await dialog.getByLabel('角色').click(); await page.locator('.ant-select-item-option-content').filter({ hasText: '會員' }).click(); await dialog.getByLabel('異動原因').fill('驗證最後管理員保護機制');
  await dialog.getByRole('button', { name: '儲存並記錄稽核' }).click(); await expect(dialog.getByText('至少必須保留一位有效管理員')).toBeVisible();
  await dialog.getByRole('button', { name: '關閉' }).click();
  await page.getByRole('tab', { name: '聊天室管理' }).click(); await expect(page.getByText('填寫管理原因後即可載入聊天室')).toBeVisible(); await page.getByPlaceholder('至少五個字，例如：處理會員內容申訴').fill('例行檢查聊天室管理權限');
  await expect(page.getByRole('table')).toBeVisible(); await page.getByRole('tab', { name: '稽核紀錄' }).click(); await expect(page.getByRole('table')).toBeVisible();
});

test('重設密碼撤銷既有登入，會員不能進入 CMS', async ({ browser, request }) => {
  const credentials = await member('密碼重設會員'); const context = await browser.newContext({ baseURL, timezoneId: 'Asia/Taipei' }); const page = await context.newPage();
  const original = await login(page, credentials); await page.goto('/admin'); await expect(page).toHaveURL(/\/chat$/);
  expect((await request.post(`${baseURL}/api/v1/auth/forgot-password`, { data: { email: credentials.email } })).status()).toBe(202);
  await page.goto(await emailLink(request, credentials.email, '重設密碼')); await page.getByLabel('密碼', { exact: true }).fill(password + 'new'); await page.getByRole('button', { name: /重設密碼/ }).click(); await expect(page.getByText('操作已完成，請重新登入')).toBeVisible();
  expect((await request.get(`${baseURL}/api/v1/chat/rooms`, { headers: { Authorization: `Bearer ${original.accessToken}` } })).status()).toBe(401);
  await login(page, { email: credentials.email, password: password + 'new' }); await context.close();
});

test('Swagger 文件與匿名錯誤遵循統一格式', async ({ request, page }) => {
  const result = await request.get(`${baseURL}/api/v1/chat/rooms`); expect(result.status()).toBe(401); const problem = await result.json(); expect(problem.errorCode).toBe('4010001'); expect(problem.traceId).toBeTruthy();
  expect((await request.get(`${baseURL}/internal/sessions/check`)).status()).toBe(404);
  for (const service of ['auth', 'account', 'message']) { const doc = await request.get(`${baseURL}/openapi/${service}/v1.json`); expect(doc.status()).toBe(200); expect((await doc.json()).openapi).toMatch(/^3\./); }
  await page.goto('/docs'); await expect(page.locator('.swagger-ui').first()).toBeVisible();
});

test('手機版可完成登入與切換對話面板', async ({ browser }) => {
  const credentials = await member('行動版會員'); const context = await browser.newContext({ baseURL, timezoneId: 'Asia/Taipei', viewport: { width: 390, height: 844 }, isMobile: true }); const page = await context.newPage();
  await login(page, credentials); await expect(page.getByText('即時連線正常')).toBeVisible();
  await page.getByRole('button', { name: '建立對話', exact: true }).click(); const dialog = page.getByRole('dialog');
  await dialog.getByLabel('群組名稱').fill('手機版對話'); await dialog.getByRole('button', { name: '建立對話', exact: true }).click();
  await expect(dialog).not.toBeVisible(); await page.getByLabel('輸入訊息').fill('手機也可以即時交流'); await page.getByRole('button', { name: /傳\s*送/ }).click();
  await expect(page.getByLabel('輸入訊息')).toHaveValue('');
  await expect(page.locator('article').getByText('手機也可以即時交流', { exact: true })).toBeVisible();
  await page.screenshot({ path: '../../artifacts/chat-mobile.png', fullPage: true });
  await page.getByRole('button', { name: /返\s*回/ }).click(); await expect(page.getByRole('heading', { name: '訊息', exact: true })).toBeVisible(); await context.close();
});
