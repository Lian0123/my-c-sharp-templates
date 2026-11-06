import { Alert, Button, Empty, Spin, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { ApiError } from './api/client';
export function ErrorNotice({ error, retry }: { error: unknown; retry?: () => void }) {
  if (!error) return null;
  return <Alert type="error" showIcon title={error instanceof Error ? error.message : '無法完成操作'}
    description={error instanceof ApiError ? `錯誤代碼 ${error.problem.errorCode} · 追蹤編號 ${error.problem.traceId}` : undefined}
    action={retry && <Button size="small" icon={<ReloadOutlined />} onClick={retry}>重試</Button>} />;
}
export function Loading() { return <div className="center-state"><Spin description="正在載入…" /></div>; }
export function Blank({ text = '目前沒有資料' }: { text?: string }) { return <div className="center-state"><Empty description={text} image={Empty.PRESENTED_IMAGE_SIMPLE} /></div>; }
export function Role({ role }: { role: string }) { return <Tag color={role === 'Admin' || role === 'Owner' ? 'blue' : 'default'}>{({ Admin: '管理員', User: '會員', Owner: '擁有者', Moderator: '協管員', Member: '成員' } as Record<string, string>)[role] ?? role}</Tag>; }
