import { useState } from 'react';
import { Alert, App, Button, Form, Input, Space, Tabs, Typography } from 'antd';
import { ArrowRightOutlined, LockOutlined, MailOutlined, MessageOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { post, session } from './api/client';
import type { Login } from './api/models';
import { ErrorNotice } from './components';
type Fields = { email: string; password: string; displayName: string };
export default function AuthPage() {
  const [mode, setMode] = useState('login'); const [busy, setBusy] = useState(false); const [error, setError] = useState<unknown>(null);
  const [sent, setSent] = useState(false); const { message } = App.useApp(); const navigate = useNavigate(); const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');
  const route = location.pathname.split('/').pop(); const verify = route === 'verify'; const reset = route === 'reset';
  async function submit(fields: Fields) {
    setBusy(true); setError(null);
    try {
      if (verify) { await post('/api/v1/auth/verify', { token }); setSent(true); }
      else if (reset) { await post('/api/v1/auth/reset', { token, password: fields.password }); setSent(true); }
      else if (mode === 'login') { session(await post<Login>('/api/v1/auth/login', fields)); navigate('/chat'); }
      else { await post(`/api/v1/auth/${({ register: 'register', forgot: 'forgot-password', resend: 'resend-verification' } as Record<string, string>)[mode]}`, mode === 'register' ? fields : { email: fields.email }); setSent(true); }
      if (!verify && !reset && mode === 'login') void message.success('歡迎回來');
    } catch (failure) { setError(failure); } finally { setBusy(false); }
  }
  return <main className="auth-layout">
    <section className="auth-story"><a className="brand" href="/"><span className="brand-icon"><MessageOutlined /></span>relay<span className="brand-dot">.</span></a>
      <div className="story-copy"><span className="eyebrow">CONNECTED, SIMPLY.</span><h1>每一次對話，<br />都讓彼此更近。</h1><p>一個地方，連結您的團隊、管理成員，<br />讓訊息安全而即時地流動。</p>
        <div className="story-features"><span><MessageOutlined /> 即時對話</span><span><TeamOutlined /> 團隊協作</span><span><SafetyCertificateOutlined /> 安全連結</span></div></div>
      <div className="story-orbit orbit-one"/><div className="story-orbit orbit-two"/><footer>RELAY WORKSPACE · 帳號與訊息管理平台</footer>
    </section>
    <section className="auth-form"><div className="auth-card"><span className="eyebrow muted">YOUR WORKSPACE</span><Typography.Title level={2}>{verify ? '驗證您的 Email' : reset ? '設定新密碼' : '歡迎來到 Relay'}</Typography.Title>
      <p className="muted">{verify ? '確認後即可開啟您的工作空間。' : reset ? '新密碼至少需 12 個字元。' : '登入帳號，開始今天的協作。'}</p>
      {!verify && !reset && <Tabs activeKey={mode === 'register' ? 'register' : 'login'} onChange={key => { setMode(key); setSent(false); setError(null); }} items={[{ key: 'login', label: '登入' }, { key: 'register', label: '建立帳號' }]} />}
      <ErrorNotice error={error}/>
      {sent ? <Space orientation="vertical" size="large" style={{ width: '100%' }}><Alert type="success" showIcon title={verify || reset ? '操作已完成，請重新登入' : '請查看您的信箱，並依照信中指示完成操作'} /><Button block onClick={() => { setSent(false); setMode('login'); navigate('/auth/login'); }}>返回登入</Button></Space>
        : <Form layout="vertical" onFinish={submit} requiredMark={false}>
          {!verify && !reset && <Form.Item label="電子郵件" name="email" rules={[{ required: true, message: '請輸入 Email' }, { type: 'email', message: 'Email 格式不正確' }]}><Input prefix={<MailOutlined />} placeholder="you@example.com" size="large" autoComplete="email" maxLength={254}/></Form.Item>}
          {mode === 'register' && <Form.Item label="顯示名稱" name="displayName" rules={[{ required: true, whitespace: true, message: '請輸入顯示名稱' }, { max: 50 }]}><Input size="large" maxLength={50} autoComplete="nickname"/></Form.Item>}
          {!verify && (reset || mode === 'login' || mode === 'register') && <Form.Item label="密碼" name="password" rules={[{ required: true, message: '請輸入密碼' }, { min: reset || mode === 'register' ? 12 : 1, max: 128, message: '密碼長度需介於 12 至 128 個字元' }]}><Input.Password prefix={<LockOutlined />} size="large" autoComplete={mode === 'login' && !reset ? 'current-password' : 'new-password'} maxLength={128}/></Form.Item>}
          <Button type="primary" htmlType="submit" block size="large" loading={busy} icon={<ArrowRightOutlined />} iconPlacement="end">{verify ? '確認驗證' : reset ? '重設密碼' : ({ login: '登入工作空間', register: '建立帳號', forgot: '寄送重設連結', resend: '重新寄送驗證信' } as Record<string, string>)[mode]}</Button>
          {!verify && !reset && <div className="auth-links"><Button type="link" onClick={() => setMode('forgot')}>忘記密碼</Button><Button type="link" onClick={() => setMode('resend')}>重寄驗證信</Button></div>}
        </Form>}
      <p className="auth-note">您的對話與附件皆受到登入驗證及存取權限保護。</p>
    </div></section>
  </main>;
}
