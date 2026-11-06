import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App as AntApp } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { api, logout } from './api/client';
import type { User } from './api/models';
const state = vi.hoisted(() => ({ loading: false, user: { id: 'me', displayName: '初始名稱', role: 'User' } as User | null }));
vi.mock('./auth', () => ({ useAuth: () => state }));
vi.mock('./api/client', async original => ({ ...await original<typeof import('./api/client')>(), api: vi.fn(), logout: vi.fn() }));
vi.mock('./ChatPage', () => ({ default: () => <div>會員聊天畫面</div> }));
vi.mock('./AdminPage', () => ({ default: () => <div>管理後台畫面</div> }));
vi.mock('./AuthPage', () => ({ default: () => <div>登入畫面</div> }));
beforeEach(() => { state.loading = false; state.user = { id: 'me', displayName: '初始名稱', role: 'User' } as User; vi.mocked(api).mockReset().mockResolvedValue({ id: 'me', displayName: '新名稱', bio: '介紹', active: true, version: 1 }); vi.mocked(logout).mockReset().mockResolvedValue(undefined); });
function page(path = '/chat') { return render(<AntApp><QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter initialEntries={[path]}><App/></MemoryRouter></QueryClientProvider></AntApp>); }
it('shows loading and redirects anonymous visitors', async () => { state.loading = true; const view = page(); expect(document.querySelector('.ant-spin')).toBeInTheDocument(); view.unmount(); state.loading = false; state.user = null; page(); await screen.findByText('登入畫面'); });
it('keeps authentication links accessible', () => { page('/auth/verify'); expect(screen.getByText('登入畫面')).toBeInTheDocument(); });
it('protects admin routes and redirects unknown routes', async () => { const view = page('/admin'); await screen.findByText('會員聊天畫面'); expect(screen.queryByLabelText('管理後台')).not.toBeInTheDocument(); view.unmount(); page('/missing'); await screen.findByText('會員聊天畫面'); });
it('switches between admin and chat areas', async () => { state.user!.role = 'Admin'; page('/admin'); await screen.findByText('管理後台畫面'); fireEvent.click(screen.getByRole('button', { name: '聊天室' })); await screen.findByText('會員聊天畫面'); fireEvent.click(screen.getByRole('button', { name: '管理後台' })); await screen.findByText('管理後台畫面'); });
it('handles provisioning and profile read failures', async () => { vi.mocked(api).mockResolvedValue({ status: 'provisioning' }); const view = page(); await screen.findByText('帳號資料初始化中，完成後會自動更新'); expect(screen.getByText('您好，初始名稱')).toBeInTheDocument(); view.unmount(); vi.mocked(api).mockRejectedValue(new Error('個人資料讀取失敗')); page(); await screen.findByText('個人資料讀取失敗'); fireEvent.click(screen.getByRole('button', { name: /重\s*試/ })); });
it('edits a member profile and surfaces validation-server errors', async () => {
  page(); await screen.findByText('您好，新名稱'); fireEvent.click(document.querySelector('.rail-avatar')!); const input = await screen.findByLabelText('顯示名稱'); fireEvent.change(input, { target: { value: '修改後' } });
  vi.mocked(api).mockRejectedValueOnce(new Error('儲存失敗')); fireEvent.click(screen.getByRole('button', { name: '儲存變更' })); await screen.findByText('儲存失敗');
  vi.mocked(api).mockResolvedValue(undefined); fireEvent.click(screen.getByRole('button', { name: '儲存變更' })); await waitFor(() => expect(api).toHaveBeenCalledWith('/api/v1/accounts/me', expect.objectContaining({ method: 'PUT' }))); await screen.findByText('個人資料已更新');
});
it('requires an admin reason and supports dropdown profile and logout actions', async () => {
  state.user!.role = 'Admin'; page(); await screen.findByText('您好，新名稱'); fireEvent.mouseEnter(screen.getByRole('button', { name: '帳號選單' })); fireEvent.click(await screen.findByText('個人資料'));
  fireEvent.change(await screen.findByLabelText('修改原因'), { target: { value: '修改管理員個人資料' } }); fireEvent.click(screen.getByRole('button', { name: '儲存變更' })); await waitFor(() => expect(api).toHaveBeenCalledWith(expect.stringContaining('?reason='), expect.objectContaining({ method: 'PUT' })));
  fireEvent.mouseEnter(screen.getByRole('button', { name: '帳號選單' })); fireEvent.click(await screen.findByText('登出')); await waitFor(() => expect(logout).toHaveBeenCalled());
});
it('keeps the session visible when server logout fails', async () => { vi.mocked(logout).mockRejectedValue(new Error('登出服務暫停')); page(); fireEvent.mouseEnter(screen.getByRole('button', { name: '帳號選單' })); fireEvent.click(await screen.findByText('登出')); await screen.findByText('登出服務暫停'); });
