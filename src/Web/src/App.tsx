import { useState } from 'react';
import { Alert, App as AntApp, Avatar, Button, Dropdown, Form, Input, Modal, Space, Tooltip } from 'antd';
import { AppstoreOutlined, CommentOutlined, EditOutlined, LogoutOutlined, MessageOutlined, QuestionCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, logout } from './api/client';
import type { Profile } from './api/models';
import { useAuth } from './auth';
import AuthPage from './AuthPage';
import ChatPage from './ChatPage';
import AdminPage from './AdminPage';
import { ErrorNotice, Loading } from './components';

export default function App() {
  const { user, loading } = useAuth(); const location = useLocation(); const navigate = useNavigate(); const queries = useQueryClient();
  const [edit, setEdit] = useState(false); const { message } = AntApp.useApp();
  const profile = useQuery({ queryKey: ['profile', user?.id], enabled: !!user, queryFn: () => api<Profile | { status: string }>('/api/v1/accounts/me'),
    refetchInterval: query => query.state.data && 'status' in query.state.data ? 2000 : false });
  const update = useMutation({ mutationFn: (values: { displayName: string; bio: string; reason?: string }) => api('/api/v1/accounts/me' + (user?.role === 'Admin' ? `?reason=${encodeURIComponent(values.reason ?? '')}` : ''), { method: 'PUT', body: JSON.stringify(values) }),
    onSuccess: () => { setEdit(false); void queries.invalidateQueries({ queryKey: ['profile'] }); void message.success('個人資料已更新'); } });
  if (loading) return <Loading/>;
  if (location.pathname.startsWith('/auth/')) return <AuthPage/>;
  if (!user) return <Navigate to="/auth/login" replace/>;
  const own = profile.data && !('status' in profile.data) ? profile.data : undefined;
  const name = own?.displayName ?? user.displayName;
  const admin = location.pathname.startsWith('/admin');
  return <div className="app-shell"><aside className="app-rail"><a className="rail-brand" href="/chat" aria-label="Relay 首頁"><MessageOutlined/></a><nav><Tooltip title="聊天室" placement="right"><button aria-label="聊天室" className={!admin ? 'active' : ''} onClick={() => navigate('/chat')}><CommentOutlined/><span>訊息</span></button></Tooltip>{user.role === 'Admin' && <Tooltip title="管理後台" placement="right"><button aria-label="管理後台" className={admin ? 'active' : ''} onClick={() => navigate('/admin')}><AppstoreOutlined/><span>管理</span></button></Tooltip>}</nav><Tooltip title="API 文件" placement="right"><a href="/docs" target="_blank" rel="noreferrer" aria-label="API 文件"><QuestionCircleOutlined/></a></Tooltip><Avatar className="rail-avatar" onClick={() => setEdit(true)}>{Array.from(name)[0]}</Avatar></aside>
    <div className="app-main"><header className="topbar"><div className="workspace-title"><span className="workspace-mark"><SafetyCertificateOutlined/></span><strong>Relay 工作空間</strong><span className="workspace-divider">/</span><span>{admin ? '管理後台' : '團隊訊息'}</span></div><Space><span className="user-greeting">您好，{name}</span><Dropdown menu={{ items: [{ key: 'profile', label: '個人資料', icon: <EditOutlined/>, onClick: () => setEdit(true) }, { key: 'logout', label: '登出', icon: <LogoutOutlined/>, onClick: () => { void logout().catch(failure => message.error(failure.message)); } }] }}><Button aria-label="帳號選單" type="text"><Avatar size="small">{Array.from(name)[0]}</Avatar></Button></Dropdown></Space></header>
      <ErrorNotice error={profile.error} retry={() => { void profile.refetch(); }}/>{profile.data && 'status' in profile.data && <Alert showIcon type="info" title="帳號資料初始化中，完成後會自動更新"/>}
      <Routes><Route path="/chat" element={<ChatPage/>}/><Route path="/admin/*" element={user.role === 'Admin' ? <AdminPage/> : <Navigate to="/chat" replace/>}/><Route path="*" element={<Navigate to="/chat" replace/>}/></Routes>
    </div>
    <Modal title="個人資料" open={edit} onCancel={() => setEdit(false)} footer={null} destroyOnHidden><Form layout="vertical" initialValues={own} key={own?.version} onFinish={values => update.mutate(values)}><Form.Item name="displayName" label="顯示名稱" rules={[{ required: true, whitespace: true }]}><Input maxLength={50}/></Form.Item><Form.Item name="bio" label="自我介紹"><Input.TextArea rows={3} maxLength={500} showCount/></Form.Item>{user.role === 'Admin' && <Form.Item name="reason" label="修改原因" rules={[{ required: true, min: 5, whitespace: true }]}><Input maxLength={1000}/></Form.Item>}<ErrorNotice error={update.error}/><Button block type="primary" htmlType="submit" loading={update.isPending}>儲存變更</Button></Form></Modal>
  </div>;
}
