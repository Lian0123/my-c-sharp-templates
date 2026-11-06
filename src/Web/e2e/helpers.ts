import { expect, request, type APIRequestContext, type Page } from '@playwright/test';
import fs from 'node:fs';
const root = new URL('../../../.env', import.meta.url);
const env = Object.fromEntries(fs.readFileSync(root, 'utf8').split('\n').filter(line => line && !line.startsWith('#') && line.includes('=')).map(line => { const index = line.indexOf('='); return [line.slice(0, index), line.slice(index + 1)]; }));
export const baseURL = process.env.BASE_URL ?? 'http://localhost:8080';
export const mailURL = process.env.MAILPIT_URL ?? 'http://localhost:8025';
export const admin = { email: process.env.E2E_ADMIN_EMAIL ?? env.BOOTSTRAP_EMAIL, password: process.env.E2E_ADMIN_PASSWORD ?? env.BOOTSTRAP_PASSWORD };
export const password = 'E2E-Password-123456!';
export async function emailLink(api: APIRequestContext, email: string, subject: string) {
  let link = '';
  await expect.poll(async () => {
    const response = await api.get(`${mailURL}/api/v1/search?query=${encodeURIComponent('to:' + email)}`);
    const data = await response.json(); const found = data.messages.find((item: { Subject: string }) => item.Subject === subject);
    if (!found) return false;
    const mail = await (await api.get(`${mailURL}/api/v1/message/${found.ID}`)).json();
    link = mail.Text.match(/https?:\/\/\S+\/auth\/\S+/)?.[0] ?? ''; return !!link;
  }, { timeout: 30_000 }).toBe(true);
  const url = new URL(link); return url.pathname + url.search;
}
export async function member(name: string) {
  const email = `e2e-${crypto.randomUUID()}@example.test`; const api = await request.newContext();
  expect((await api.post(`${baseURL}/api/v1/auth/register`, { data: { email, password, displayName: name } })).status()).toBe(202);
  const link = await emailLink(api, email, '驗證您的 Email');
  expect((await api.post(`${baseURL}/api/v1/auth/verify`, { data: { token: new URL(link, baseURL).searchParams.get('token') } })).status()).toBe(204);
  await api.dispose(); return { email, password, name };
}
export async function login(page: Page, credentials: { email: string; password: string }) {
  await page.goto('/auth/login'); await page.getByLabel('電子郵件').fill(credentials.email); await page.getByLabel('密碼', { exact: true }).fill(credentials.password);
  const response = page.waitForResponse(value => value.url().endsWith('/api/v1/auth/login') && value.request().method() === 'POST');
  await page.getByRole('button', { name: /登入工作空間/ }).click(); expect((await response).status()).toBe(200);
  const result = await (await response).json(); await expect(page).toHaveURL(/\/chat$/); return result as { accessToken: string; user: { id: string; role: string } };
}
