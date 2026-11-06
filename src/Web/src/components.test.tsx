import { fireEvent, render, screen } from '@testing-library/react';
import { ApiError } from './api/client';
import { Blank, ErrorNotice, Loading, Role } from './components';
it('renders every error presentation and retry action', () => {
  const retry = vi.fn(); const { rerender } = render(<ErrorNotice error={null}/>); expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  rerender(<ErrorNotice error="failed"/>); expect(screen.getByText('無法完成操作')).toBeInTheDocument();
  rerender(<ErrorNotice error={new Error('連線中斷')} retry={retry}/>); fireEvent.click(screen.getByText('重試')); expect(retry).toHaveBeenCalledOnce();
  rerender(<ErrorNotice error={new ApiError({ status: 403, title: '禁止', detail: '禁止操作', errorCode: '4030001', traceId: 'abc' })}/>); expect(screen.getByText(/4030001/)).toHaveTextContent('abc');
});
it('renders empty, loading and all role labels', () => {
  const { rerender } = render(<Blank/>); expect(screen.getByText('目前沒有資料')).toBeInTheDocument(); rerender(<Blank text="尚無訊息"/>); expect(screen.getByText('尚無訊息')).toBeInTheDocument();
  rerender(<Loading/>); expect(document.querySelector('.ant-spin')).toBeInTheDocument();
  for (const [role, label] of [['Admin', '管理員'], ['User', '會員'], ['Owner', '擁有者'], ['Moderator', '協管員'], ['Member', '成員'], ['Custom', 'Custom']]) { rerender(<Role role={role}/>); expect(screen.getByText(label)).toBeInTheDocument(); }
});
