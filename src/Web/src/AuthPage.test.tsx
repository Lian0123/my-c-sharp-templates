import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import AuthPage from './AuthPage';
import { post, session } from './api/client';
vi.mock('./api/client', async original => ({ ...await original<typeof import('./api/client')>(), post: vi.fn(), session: vi.fn() }));
function page(path = '/auth/login') { return render(<App><MemoryRouter initialEntries={[path]}><AuthPage/></MemoryRouter></App>); }
async function fill(label: string, value: string) { fireEvent.change(screen.getByLabelText(label), { target: { value } }); }
beforeEach(() => { vi.mocked(post).mockReset(); vi.mocked(post).mockResolvedValue(undefined); });
it('logs in with validated form inputs', async () => {
  vi.mocked(post).mockResolvedValue({ accessToken: 'token' }); page(); await fill('電子郵件', 'u@example.com'); await fill('密碼', 'password-long'); fireEvent.click(screen.getByRole('button', { name: /登入工作空間/ }));
  await waitFor(() => expect(session).toHaveBeenCalledWith({ accessToken: 'token' }));
});
it('validates missing fields before calling the API', async () => { page(); fireEvent.click(screen.getByRole('button', { name: /登入工作空間/ })); await screen.findByText('請輸入 Email'); expect(post).not.toHaveBeenCalled(); });
it('registers, shows confirmation and returns to login', async () => {
  page(); fireEvent.click(screen.getByRole('tab', { name: '建立帳號' })); await fill('電子郵件', 'u@example.com'); await fill('顯示名稱', '會員'); await fill('密碼', 'password-long'); fireEvent.click(screen.getByRole('button', { name: /建立帳號/ }));
  await screen.findByText(/請查看您的信箱/); expect(post).toHaveBeenCalledWith('/api/v1/auth/register', expect.objectContaining({ displayName: '會員' })); fireEvent.click(screen.getByRole('button', { name: '返回登入' })); expect(screen.getByRole('button', { name: /登入工作空間/ })).toBeInTheDocument();
});
it.each([['忘記密碼', '寄送重設連結', 'forgot-password'], ['重寄驗證信', '重新寄送驗證信', 'resend-verification']])('handles %s', async (link, button, path) => {
  page(); fireEvent.click(screen.getByRole('button', { name: link })); await fill('電子郵件', 'u@example.com'); fireEvent.click(screen.getByRole('button', { name: new RegExp(button) })); await screen.findByText(/請查看您的信箱/); expect(post).toHaveBeenCalledWith(`/api/v1/auth/${path}`, { email: 'u@example.com' });
});
it('verifies email with the URL token', async () => { page('/auth/verify?token=verify-token'); fireEvent.click(screen.getByRole('button', { name: /確認驗證/ })); await screen.findByText('操作已完成，請重新登入'); expect(post).toHaveBeenCalledWith('/api/v1/auth/verify', { token: 'verify-token' }); });
it('resets passwords with the URL token', async () => { page('/auth/reset?token=reset-token'); await fill('密碼', 'password-long'); fireEvent.click(screen.getByRole('button', { name: /重設密碼/ })); await screen.findByText('操作已完成，請重新登入'); expect(post).toHaveBeenCalledWith('/api/v1/auth/reset', { token: 'reset-token', password: 'password-long' }); });
it('shows backend errors and allows changing forms', async () => { vi.mocked(post).mockRejectedValue(new Error('登入失敗')); page(); await fill('電子郵件', 'u@example.com'); await fill('密碼', 'password-long'); fireEvent.click(screen.getByRole('button', { name: /登入工作空間/ })); await screen.findByText('登入失敗'); fireEvent.click(screen.getByRole('tab', { name: '建立帳號' })); expect(screen.queryByText('登入失敗')).not.toBeInTheDocument(); });
