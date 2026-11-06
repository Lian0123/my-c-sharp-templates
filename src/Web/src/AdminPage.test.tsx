import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { App, ConfigProvider } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminPage from './AdminPage';
import { api, download } from './api/client';
import type { Attachment, Audit, ChatMessage, Page, Profile, Room, User } from './api/models';
vi.mock('./api/client', async original => ({ ...await original<typeof import('./api/client')>(), api: vi.fn(), download: vi.fn() }));
let users: User[]; let profiles: Profile[]; let rooms: Room[]; let attachments: Attachment[]; let audits: Audit[]; let history: Page<ChatMessage>; let health: Record<string, { ready: boolean }>;
beforeEach(() => {
  users = [{ id: 'u', email: 'u@example.com', displayName: '初始名字', role: 'Admin', active: true, emailVerified: true, createdAt: '2026-11-06T01:00:00Z' }, { id: 'v', email: 'v@example.com', displayName: '未啟用會員', role: 'User', active: false, emailVerified: false, createdAt: '2026-11-06T02:00:00Z' }];
  profiles = [{ id: 'u', displayName: '更新名字', bio: '介紹', active: true, version: 1 }, { id: 'new', displayName: '新成員', bio: '', active: true, version: 1 }];
  rooms = [{ id: 'r', name: '管理群組', kind: 'group', unreadCount: 0, lastSequence: 2, members: [{ userId: 'u', displayName: '擁有者', role: 'Owner', lastReadSequence: 0, online: true }, { userId: 'v', displayName: '成員名字', role: 'Member', lastReadSequence: 0, online: false }] }, { id: 'd', name: '私人對話', kind: 'direct', unreadCount: 0, lastSequence: 0, members: [] }];
  attachments = [{ id: 'a', fileName: '稽核附件.txt', contentType: 'text/plain', size: 1024 }];
  audits = [{ id: 'audit', actorId: 'u', action: 'message.moderate', target: 'm', reason: '測試管理原因', createdAt: '2026-11-06T01:00:00Z' }];
  history = { items: [{ id: 'm', clientMessageId: 'c', senderId: 'u', senderName: '發送成員', text: '待管理訊息', sequence: 1, deleted: false, createdAt: '', attachments }, { id: 'deleted', clientMessageId: 'd', senderId: 'u', senderName: '發送成員', text: '已移除訊息', sequence: 2, deleted: true, createdAt: '', attachments: [] }], nextCursor: null };
  health = { auth: { ready: true }, account: { ready: true }, message: { ready: true } };
  vi.mocked(api).mockReset().mockImplementation(async <T,>(path: string, options?: RequestInit) => {
    if (options?.method) return undefined as T;
    if (path.includes('/system/')) return health as T;
    if (path.includes('/admin/users')) return users as T;
    if (path.includes('/accounts/?')) return profiles as T;
    if (path.includes('/admin/rooms')) return rooms as T;
    if (path.includes('/admin/attachments')) return attachments as T;
    if (path.includes('/messages')) return history as T;
    return audits as T;
  });
  vi.mocked(download).mockReset().mockResolvedValue(undefined);
});
function page() { return render(<ConfigProvider locale={zhTW}><App><QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}><AdminPage/></QueryClientProvider></App></ConfigProvider>); }
async function reason(section: string) { fireEvent.click(screen.getByRole('tab', { name: section })); await screen.findByText(/填寫管理原因後即可載入/); fireEvent.change(screen.getByPlaceholderText('至少五個字，例如：處理會員內容申訴'), { target: { value: '處理會員內容申訴案件' } }); }
it('renders real loaded account statistics, healthy services and shortcuts', async () => {
  page(); await screen.findByText('全部就緒'); expect(screen.getByText('u@example.com')).toBeInTheDocument(); fireEvent.click(screen.getByRole('button', { name: /重新整理/ }));
  fireEvent.click(screen.getByRole('button', { name: /管理成員與權限/ })); await screen.findByText('更新名字'); expect(screen.getByText('未啟用會員')).toBeInTheDocument(); expect(screen.getByText('未驗證')).toBeInTheDocument();
});
it('renders unavailable services and fetch errors', async () => {
  health.message.ready = false; page(); await screen.findByText('檢查服務狀態'); await waitFor(() => expect(screen.getAllByText('未就緒')).toHaveLength(1));
});
it('edits identity settings and records an explicit reason', async () => {
  page(); fireEvent.click(screen.getByRole('tab', { name: '帳號與權限' })); fireEvent.click((await screen.findAllByRole('button', { name: '權限與狀態' }))[0]);
  const dialog = await screen.findByRole('dialog'); fireEvent.change(within(dialog).getByLabelText('異動原因'), { target: { value: '調整測試帳號狀態權限' } });
  fireEvent.click(within(dialog).getByRole('button', { name: '儲存並記錄稽核' })); await waitFor(() => expect(api).toHaveBeenCalledWith('/api/v1/auth/admin/users/u', expect.objectContaining({ method: 'PUT', body: expect.stringContaining('"active":true') })));
  await screen.findByText('變更已儲存並記錄稽核');
});
it('edits profile data and surfaces save failures', async () => {
  page(); fireEvent.click(screen.getByRole('tab', { name: '帳號與權限' })); const buttons = await screen.findAllByRole('button', { name: '個人資料' }); await waitFor(() => expect(buttons[0]).not.toBeDisabled()); fireEvent.click(buttons[0]);
  const dialog = await screen.findByRole('dialog'); fireEvent.change(within(dialog).getByLabelText('異動原因'), { target: { value: '修正個人資料顯示名稱' } });
  vi.mocked(api).mockRejectedValueOnce(new Error('資料儲存失敗')); fireEvent.click(within(dialog).getByRole('button', { name: '儲存並記錄稽核' })); await screen.findByText('資料儲存失敗');
  fireEvent.click(within(dialog).getByRole('button', { name: '儲存並記錄稽核' })); await waitFor(() => expect(api).toHaveBeenCalledWith(expect.stringContaining('/api/v1/accounts/admin/u?reason='), expect.objectContaining({ method: 'PUT' })));
});
it('audits room reads, moderates messages and manages membership', async () => {
  page(); await reason('聊天室管理'); fireEvent.click((await screen.findAllByRole('button', { name: '檢視與管理' }))[0]); const dialog = await screen.findByRole('dialog'); await within(dialog).findByText('待管理訊息');
  fireEvent.click(within(dialog).getByRole('button', { name: '調整權限' })); await waitFor(() => expect(api).toHaveBeenCalledWith(expect.stringContaining('/members?reason='), expect.objectContaining({ method: 'PUT' })));
  const row = within(dialog).getByText('成員名字').closest('tr')!; fireEvent.click(within(row).getByRole('button', { name: /移\s*除/ })); await waitFor(() => expect(api).toHaveBeenCalledWith(expect.stringContaining('/members/v?reason='), expect.objectContaining({ method: 'DELETE' })));
  const messageRow = within(dialog).getByText('待管理訊息').closest('tr')!; fireEvent.click(within(messageRow).getByRole('button', { name: /移\s*除/ })); await screen.findAllByText('移除此訊息？'); fireEvent.click(screen.getByRole('button', { name: /確\s*定/ })); await waitFor(() => expect(api).toHaveBeenCalledWith(expect.stringContaining('/messages/m?reason='), expect.objectContaining({ method: 'DELETE' })));
  fireEvent.click(within(dialog).getByText('稽核附件.txt')); await waitFor(() => expect(download).toHaveBeenCalledWith('a', '稽核附件.txt', '處理會員內容申訴案件'));
});
it('lists and authorizes attachment downloads with an audit reason', async () => {
  page(); await reason('附件管理'); await screen.findByText('稽核附件.txt'); fireEvent.click(screen.getByRole('button', { name: /下\s*載/ })); await waitFor(() => expect(download).toHaveBeenCalledWith('a', '稽核附件.txt', '處理會員內容申訴案件'));
  vi.mocked(download).mockRejectedValueOnce(new Error('附件下載失敗')); fireEvent.click(screen.getByRole('button', { name: /下\s*載/ })); await screen.findByText('附件下載失敗');
});
it('loads audit records from each selected service', async () => {
  page(); fireEvent.click(screen.getByRole('tab', { name: '稽核紀錄' })); await screen.findByText('message.moderate');
  fireEvent.mouseDown(screen.getByRole('combobox', { name: '稽核服務' })); fireEvent.click(await screen.findByText('Account 帳號服務', { selector: '.ant-select-item-option-content' })); await waitFor(() => expect(api).toHaveBeenCalledWith('/api/v1/accounts/admin/audit?limit=100'));
});
it('shows errors on overview, profile, room, attachment and audit queries', async () => {
  vi.mocked(api).mockRejectedValue(new Error('管理服務暫停')); page(); await screen.findByText('管理服務暫停'); fireEvent.click(screen.getByRole('tab', { name: '帳號與權限' })); await waitFor(() => expect(screen.getAllByText('管理服務暫停').length).toBeGreaterThan(1));
  await reason('聊天室管理'); await waitFor(() => expect(screen.getAllByText('管理服務暫停').length).toBeGreaterThan(1)); fireEvent.click(screen.getByRole('tab', { name: '附件管理' })); await waitFor(() => expect(screen.getAllByText('管理服務暫停').length).toBeGreaterThan(1)); fireEvent.click(screen.getByRole('tab', { name: '稽核紀錄' })); await waitFor(() => expect(screen.getAllByText('管理服務暫停').length).toBeGreaterThan(1));
});
