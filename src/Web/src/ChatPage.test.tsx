import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { App, ConfigProvider } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChatPage from './ChatPage';
import { api, download, post, sessionEvents, upload } from './api/client';
import type { ChatMessage, Page, Room, User } from './api/models';
const mock = vi.hoisted(() => ({ user: { id: 'me', role: 'User' } as User, events: {} as Record<string, (...args: unknown[]) => void>, start: vi.fn(), stop: vi.fn(), invoke: vi.fn(), state: 'Connected' }));
vi.mock('./auth', () => ({ useAuth: () => ({ user: mock.user }) }));
vi.mock('./api/client', async original => ({ ...await original<typeof import('./api/client')>(), api: vi.fn(), post: vi.fn(), download: vi.fn(), upload: vi.fn(), token: () => 'jwt' }));
vi.mock('@microsoft/signalr', () => ({ HttpTransportType: { WebSockets: 1 }, LogLevel: { Error: 4 }, HubConnectionBuilder: class {
  withUrl() { return this; } withAutomaticReconnect() { return this; } configureLogging() { return this; }
  build() { return { get state() { return mock.state; }, on: (name: string, callback: (...args: unknown[]) => void) => { mock.events[name] = callback; }, onreconnecting: (callback: () => void) => { mock.events.reconnecting = callback; }, onreconnected: (callback: () => void) => { mock.events.reconnected = callback; }, onclose: (callback: () => void) => { mock.events.close = callback; }, start: mock.start, stop: mock.stop, invoke: mock.invoke }; }
} }));
let rooms: Room[]; let pages: Page<ChatMessage>; let queries: QueryClient;
const file = { id: 'attachment', fileName: '附件.txt', contentType: 'text/plain', size: 1024 };
beforeEach(() => {
  vi.mocked(api).mockReset(); vi.mocked(post).mockReset(); vi.mocked(upload).mockReset(); vi.mocked(download).mockReset();
  mock.user = { id: 'me', role: 'User', displayName: '自己' } as User; mock.state = 'Connected'; mock.events = {};
  mock.start.mockReset().mockResolvedValue(undefined); mock.stop.mockReset().mockResolvedValue(undefined); mock.invoke.mockReset().mockResolvedValue(undefined);
  rooms = [{ id: 'room', name: '開發小組', kind: 'group', unreadCount: 2, lastSequence: 3, members: [
    { userId: 'me', displayName: '自己', role: 'Owner', online: true, lastReadSequence: 1 },
    { userId: 'other', displayName: '同事', role: 'Moderator', online: true, lastReadSequence: 2 },
    { userId: 'third', displayName: '另一位', role: 'Member', online: false, lastReadSequence: 0 }] },
    { id: 'direct', name: '私人對話', kind: 'direct', unreadCount: 0, lastSequence: 0, members: [{ userId: 'other', displayName: '同事', role: 'Member', online: false, lastReadSequence: 0 }] }];
  pages = { items: [{ id: '1', clientMessageId: 'c1', senderId: 'other', senderName: '同事', sequence: 1, text: '你好團隊', deleted: false, createdAt: '2026-11-06T01:00:00Z', attachments: [file] },
    { id: '2', clientMessageId: 'c2', senderId: 'me', senderName: '自己', sequence: 2, text: '我的訊息', deleted: false, createdAt: '2026-11-06T01:01:00Z', attachments: [] },
    { id: '3', clientMessageId: 'c3', senderId: 'me', senderName: '自己', sequence: 3, text: '此訊息已由管理員移除', deleted: true, createdAt: '2026-11-06T01:02:00Z', attachments: [] }], nextCursor: '1' };
  vi.mocked(api).mockImplementation(async <T,>(path: string, options?: RequestInit) => {
    if (options?.method) return undefined as T;
    if (path.startsWith('/api/v1/accounts/')) return [{ id: 'new', displayName: '新成員', bio: '', active: true, version: 1 }, { id: 'me', displayName: '自己' }] as T;
    if (path === '/api/v1/chat/rooms') return structuredClone(rooms) as T;
    if (path.includes('after=')) return { items: [], nextCursor: null } as T;
    return structuredClone(pages) as T;
  });
  vi.mocked(post).mockImplementation(async <T,>(path: string, body?: unknown) => {
    if (path.endsWith('/messages')) return { ...pages.items[1], id: '4', sequence: 4, text: (body as { text: string }).text } as T;
    const created = { ...rooms[0], id: 'created', name: '新群組' }; rooms.push(created); return created as T;
  });
  vi.mocked(download).mockResolvedValue(undefined); vi.mocked(upload).mockImplementation(async (_id, _file, progress) => { progress(70); return file; });
  queries = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } } });
});
function page() { return render(<ConfigProvider locale={zhTW}><App><QueryClientProvider client={queries}><ChatPage/></QueryClientProvider></App></ConfigProvider>); }
async function selectRoom() { fireEvent.click(await screen.findByText('開發小組')); await screen.findByText('你好團隊'); }
it('renders rooms, message history, read receipts, files and realtime state', async () => {
  page(); await selectRoom(); expect(screen.getByText('已讀')).toBeInTheDocument(); expect(screen.getByText('已送出')).toBeInTheDocument();
  fireEvent.click(screen.getByText('附件.txt')); await waitFor(() => expect(download).toHaveBeenCalledWith('attachment', '附件.txt'));
  act(() => mock.events.reconnecting()); expect(screen.getByText('正在重新連線…')).toBeInTheDocument(); act(() => mock.events.reconnected()); await screen.findByText('即時連線正常');
  act(() => mock.events.close()); expect(screen.getByText('即時連線中斷，點擊重試')).toBeInTheDocument(); fireEvent.click(screen.getByText('即時連線中斷，點擊重試')); await waitFor(() => expect(mock.start).toHaveBeenCalledTimes(2));
  act(() => mock.events.changed({ roomId: 'other-room' })); act(() => mock.events.changed({ roomId: 'room', messageId: '1', sequence: 1 }));
  await waitFor(() => expect(api).toHaveBeenCalledWith('/api/v1/chat/rooms/room/messages?before=2&limit=1'));
  act(() => sessionEvents.dispatchEvent(new Event('change'))); await waitFor(() => expect(mock.start).toHaveBeenCalledTimes(3));
});
it('keeps clientMessageId stable when retrying the same failed send', async () => {
  vi.mocked(post).mockRejectedValueOnce(new Error('訊息暫時無法送出')); page(); await selectRoom(); fireEvent.change(screen.getByLabelText('輸入訊息'), { target: { value: '重送測試' } });
  fireEvent.click(screen.getByRole('button', { name: /傳\s*送/ })); await screen.findByText('訊息暫時無法送出'); const first = vi.mocked(post).mock.calls[0][1];
  fireEvent.click(screen.getByRole('button', { name: /傳\s*送/ })); await waitFor(() => expect(post).toHaveBeenCalledTimes(2)); expect(vi.mocked(post).mock.calls[1][1]).toEqual(first);
  await waitFor(() => expect(screen.getByLabelText('輸入訊息')).toHaveValue(''));
});
it('sends with Enter but preserves Shift+Enter and ignores empty drafts', async () => {
  page(); await selectRoom(); const input = screen.getByLabelText('輸入訊息'); fireEvent.keyDown(input, { key: 'Enter' }); expect(post).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: '鍵盤訊息' } }); fireEvent.keyDown(input, { key: 'Enter', shiftKey: true }); expect(post).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: 'Enter' }); await waitFor(() => expect(post).toHaveBeenCalled());
});
it('uploads, binds and removes attachments with visible progress', async () => {
  page(); await selectRoom(); fireEvent.click(screen.getByRole('button', { name: /附加檔案/ }));
  fireEvent.change(screen.getByLabelText('選擇附件'), { target: { files: [new File(['hello'], '上傳.txt', { type: 'text/plain' })] } });
  await waitFor(() => expect(upload).toHaveBeenCalled()); await waitFor(() => expect(screen.getByRole('button', { name: /傳\s*送/ })).not.toBeDisabled());
  fireEvent.click(screen.getByRole('button', { name: /傳\s*送/ })); await waitFor(() => expect(post).toHaveBeenCalledWith('/api/v1/chat/rooms/room/messages', expect.objectContaining({ attachmentIds: ['attachment'] })));
  fireEvent.change(screen.getByLabelText('選擇附件'), { target: { files: [new File(['x'], '移除.txt')] } }); await screen.findByText(/移除.txt/); fireEvent.click(screen.getByRole('button', { name: '移除' })); await waitFor(() => expect(screen.queryByText(/移除.txt/)).not.toBeInTheDocument());
});
it('rejects attachment count and size boundaries and supports failed-upload retry', async () => {
  page(); await selectRoom(); const input = screen.getByLabelText('選擇附件');
  fireEvent.change(input, { target: { files: Array.from({ length: 6 }, () => new File(['x'], 'a.txt')) } }); await screen.findByText('每則訊息最多五個附件');
  fireEvent.change(input, { target: { files: [new File([], 'empty.txt')] } }); await screen.findByText('附件不可為空，且每檔最多 20 MiB');
  vi.mocked(upload).mockRejectedValueOnce(new Error('網路中斷')); fireEvent.change(input, { target: { files: [new File(['x'], 'retry.txt')] } }); await screen.findByText('網路中斷');
  fireEvent.click(screen.getByRole('button', { name: '重試上傳' })); await waitFor(() => expect(upload).toHaveBeenCalledTimes(2)); await waitFor(() => expect(screen.queryByText('網路中斷')).not.toBeInTheDocument());
});
it('loads older history and surfaces loading failures', async () => {
  page(); await selectRoom(); fireEvent.click(screen.getByRole('button', { name: '載入更早的訊息' })); await waitFor(() => expect(api).toHaveBeenCalledWith('/api/v1/chat/rooms/room/messages?before=1'));
  vi.mocked(api).mockRejectedValueOnce(new Error('歷史載入失敗')); fireEvent.click(screen.getByRole('button', { name: '載入更早的訊息' })); await screen.findByText('歷史載入失敗');
});
it('creates a group and searches for people', async () => {
  page(); await screen.findByText('開發小組'); fireEvent.click(screen.getByRole('button', { name: '建立對話' })); const dialog = await screen.findByRole('dialog');
  fireEvent.change(within(dialog).getByLabelText('群組名稱'), { target: { value: '新群組' } }); fireEvent.click(within(dialog).getByRole('button', { name: '建立對話' }));
  await waitFor(() => expect(post).toHaveBeenCalledWith('/api/v1/chat/rooms', expect.objectContaining({ name: '新群組' })));
});
it('shows group membership and validates admin operation reasons', async () => {
  mock.user.role = 'Admin'; page(); await selectRoom(); fireEvent.click(screen.getByRole('button', { name: '聊天室資訊' })); await screen.findByRole('dialog');
  fireEvent.change(screen.getByPlaceholderText('管理操作原因（至少五個字）'), { target: { value: '測試會員權限管理' } });
  fireEvent.click(screen.getAllByRole('button', { name: '調整權限' })[0]); await waitFor(() => expect(api).toHaveBeenCalledWith(expect.stringContaining('reason='), expect.objectContaining({ method: 'PUT' })));
  fireEvent.click(screen.getByRole('button', { name: /新增成員/ })); await screen.findByText('會員');
});
it('filters rooms and renders initial empty states', async () => {
  rooms = []; page(); await screen.findByText('建立第一個對話，開始交流'); fireEvent.click(screen.getByRole('button', { name: /開始新對話/ })); expect(await screen.findByRole('dialog')).toBeInTheDocument();
});
it('supports empty histories and direct conversations', async () => {
  pages = { items: [], nextCursor: null }; page(); await screen.findByText('同事'); fireEvent.click(screen.getByText('同事')); await screen.findByText('還沒有訊息，打聲招呼吧'); fireEvent.click(screen.getByRole('button', { name: /返\s*回/ })); expect(screen.getByText('讓對話開始流動')).toBeInTheDocument();
});
it('shows API failures and websocket connection failures without losing the page', async () => {
  vi.mocked(api).mockRejectedValue(new Error('服務暫停')); mock.start.mockRejectedValue(new Error('offline')); page(); await screen.findByText('服務暫停'); await screen.findByText('即時連線中斷，點擊重試'); fireEvent.click(within(screen.getByRole('alert')).getByRole('button', { name: /重\s*試/ })); await waitFor(() => expect(api).toHaveBeenCalledTimes(2));
});
