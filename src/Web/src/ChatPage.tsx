import { useEffect, useMemo, useRef, useState } from 'react';
import { App, Avatar, Badge, Button, Form, Input, Modal, Progress, Select, Space, Tooltip, Typography } from 'antd';
import { CheckOutlined, FileOutlined, InfoCircleOutlined, LoadingOutlined, PaperClipOutlined, PlusOutlined, SendOutlined, TeamOutlined, UserAddOutlined, WifiOutlined } from '@ant-design/icons';
import { HubConnectionBuilder, HttpTransportType, LogLevel } from '@microsoft/signalr';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, download, post, sessionEvents, token, upload, uuid } from './api/client';
import type { Attachment, ChatMessage, Page, Profile, Room } from './api/models';
import { useAuth } from './auth';
import { Blank, ErrorNotice, Loading, Role } from './components';

export function mergeMessages(a: ChatMessage[], b: ChatMessage[]) { return [...new Map([...a, ...b].map(x => [x.id, x])).values()].sort((x, y) => Number(x.sequence) - Number(y.sequence)); }
export async function catchUp(roomId: string, previous?: Page<ChatMessage>) {
  const base = `/api/v1/chat/rooms/${roomId}/messages`;
  if (!previous?.items.length) return api<Page<ChatMessage>>(base);
  let items = previous.items; let cursor = items.at(-1)!.sequence;
  let next: string | null;
  do {
    const page = await api<Page<ChatMessage>>(`${base}?after=${cursor}&limit=100`);
    items = mergeMessages(items, page.items); next = page.nextCursor;
    cursor = Number(next ?? page.items.at(-1)?.sequence ?? cursor);
  } while (next);
  const recent = await api<Page<ChatMessage>>(base);
  return { items: mergeMessages(items, recent.items), nextCursor: previous.nextCursor };
}

type PendingFile = { id: string; file: File; progress: number; value?: Attachment; error?: string };
export default function ChatPage() {
  const { user } = useAuth(); const queries = useQueryClient(); const { message, modal } = App.useApp();
  const [selected, setSelected] = useState<string>(); const selectedRef = useRef(selected); selectedRef.current = selected;
  const [search, setSearch] = useState(''); const [draft, setDraft] = useState(''); const [files, setFiles] = useState<PendingFile[]>([]);
  const [create, setCreate] = useState(false); const [createKind, setCreateKind] = useState('group'); const [details, setDetails] = useState(false);
  const [addMember, setAddMember] = useState(false); const [memberReason, setMemberReason] = useState('');
  const [connection, setConnection] = useState('connecting'); const [reconnect, setReconnect] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null); const end = useRef<HTMLDivElement>(null);
  const sent = useRef<{ signature: string; id: string } | null>(null); const marked = useRef(new Map<string, number>());
  const rooms = useQuery({ queryKey: ['rooms'], queryFn: () => api<Room[]>('/api/v1/chat/rooms'), refetchInterval: 15_000 });
  const profiles = useQuery({ queryKey: ['people', search], queryFn: () => api<Profile[]>(`/api/v1/accounts/?search=${encodeURIComponent(search)}&limit=100`), enabled: create || addMember });
  const room = rooms.data?.find(x => x.id === selected);
  const history = useQuery({ queryKey: ['messages', selected], enabled: !!selected,
    queryFn: () => catchUp(selected!, queries.getQueryData<Page<ChatMessage>>(['messages', selected])), refetchInterval: 15_000 });
  const messages = useMemo(() => history.data?.items ?? [], [history.data]);
  useEffect(() => {
    let alive = true;
    const hub = new HubConnectionBuilder().withUrl('/hubs/chat', { accessTokenFactory: token, transport: HttpTransportType.WebSockets, skipNegotiation: true })
      .withAutomaticReconnect([0, 1000, 3000, 5000, 10000]).configureLogging(LogLevel.Error).build();
    hub.on('changed', (event: { roomId: string; messageId?: string; sequence?: number }) => {
      void queries.invalidateQueries({ queryKey: ['rooms'] });
      if (event.roomId === selectedRef.current) {
        void queries.invalidateQueries({ queryKey: ['messages', event.roomId] });
        if (event.messageId && event.sequence) void api<Page<ChatMessage>>(`/api/v1/chat/rooms/${event.roomId}/messages?before=${event.sequence + 1}&limit=1`)
          .then(page => queries.setQueryData<Page<ChatMessage>>(['messages', event.roomId], old => old ? { ...old, items: mergeMessages(old.items, page.items) } : page)).catch(() => undefined);
      }
    });
    hub.onreconnecting(() => { if (alive) setConnection('connecting'); });
    hub.onreconnected(() => { if (alive) { setConnection('online'); void queries.invalidateQueries({ queryKey: ['messages'] }); } });
    hub.onclose(() => { if (alive) setConnection('offline'); });
    const start = () => hub.start().then(() => { if (alive) setConnection('online'); }).catch(() => { if (alive) setConnection('offline'); });
    void start();
    const renewed = () => { void hub.stop().then(() => { if (alive && token()) return start(); }); };
    sessionEvents.addEventListener('change', renewed);
    const timer = window.setInterval(() => { if (hub.state === 'Connected') void hub.invoke('Heartbeat').catch(() => hub.stop()); }, 30_000);
    return () => { alive = false; clearInterval(timer); sessionEvents.removeEventListener('change', renewed); void hub.stop(); };
  }, [queries, user?.id, reconnect]);
  useEffect(() => {
    if (!selected || !messages.length || document.hidden) return;
    const sequence = Number(messages.at(-1)!.sequence);
    if ((marked.current.get(selected) ?? 0) >= sequence) return;
    marked.current.set(selected, sequence);
    void api(`/api/v1/chat/rooms/${selected}/read`, { method: 'PUT', body: JSON.stringify({ sequence }) })
      .then(() => queries.invalidateQueries({ queryKey: ['rooms'] })).catch(() => { marked.current.delete(selected); });
    end.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected, messages, queries]);
  const send = useMutation({ mutationFn: async () => {
    const attachmentIds = files.map(x => x.value!.id);
    const signature = JSON.stringify({ room: selected, draft, attachmentIds });
    if (sent.current?.signature !== signature) sent.current = { signature, id: uuid() };
    return post<ChatMessage>(`/api/v1/chat/rooms/${selected}/messages`, { clientMessageId: sent.current.id, text: draft, attachmentIds });
  }, onSuccess: value => {
    queries.setQueryData<Page<ChatMessage>>(['messages', selected], old => ({ items: mergeMessages(old?.items ?? [], [value]), nextCursor: old?.nextCursor ?? null }));
    setDraft(''); setFiles([]); sent.current = null; void queries.invalidateQueries({ queryKey: ['rooms'] });
  } });
  const createRoom = useMutation({ mutationFn: (values: { name: string; members: string[]; userId: string }) => createKind === 'direct'
    ? post<Room>('/api/v1/chat/direct', { userId: values.userId }) : post<Room>('/api/v1/chat/rooms', values),
    onSuccess: value => { setSelected(value.id); setCreate(false); void queries.invalidateQueries({ queryKey: ['rooms'] }); } });
  async function uploadFile(item: PendingFile) {
    const update = (data: Partial<PendingFile>) => setFiles(old => old.map(x => x.id === item.id ? { ...x, ...data } : x));
    update({ error: undefined, progress: 0 });
    try { update({ value: await upload(selected!, item.file, progress => update({ progress })), progress: 100 }); }
    catch (failure) { update({ error: failure instanceof Error ? failure.message : '上傳失敗' }); }
  }
  function chooseFiles(list: FileList | null) {
    const incoming = Array.from(list ?? []);
    if (files.length + incoming.length > 5) { void message.error('每則訊息最多五個附件'); return; }
    if (incoming.some(file => file.size === 0 || file.size > 20 * 1024 * 1024)) { void message.error('附件不可為空，且每檔最多 20 MiB'); return; }
    const pending = incoming.map(file => ({ id: uuid(), file, progress: 0 }));
    setFiles(old => [...old, ...pending]); pending.forEach(item => { void uploadFile(item); });
  }
  async function older() {
    try {
      const page = await api<Page<ChatMessage>>(`/api/v1/chat/rooms/${selected}/messages?before=${messages[0].sequence}`);
      queries.setQueryData<Page<ChatMessage>>(['messages', selected], old => ({ items: mergeMessages(page.items, old?.items ?? []), nextCursor: page.nextCursor }));
    } catch (failure) { void message.error(failure instanceof Error ? failure.message : '載入失敗'); }
  }
  async function memberAction(userId: string, role: string, remove = false) {
    try {
      const suffix = user?.role === 'Admin' ? `?reason=${encodeURIComponent(memberReason)}` : '';
      await api(`/api/v1/chat/rooms/${selected}/members${remove ? `/${userId}` : ''}${suffix}`, { method: remove ? 'DELETE' : 'PUT', body: remove ? undefined : JSON.stringify({ userId, role }) });
      setAddMember(false); void queries.invalidateQueries({ queryKey: ['rooms'] });
    } catch (failure) { void message.error(failure instanceof Error ? failure.message : '操作失敗'); }
  }
  const ownRole = room?.members.find(x => x.userId === user?.id)?.role;
  const canManage = ownRole === 'Owner' || ownRole === 'Moderator' || user?.role === 'Admin';
  return <div className={`chat-workspace ${selected ? 'has-selection' : ''}`}>
    <aside className="room-panel"><div className="panel-heading"><div><span className="eyebrow muted">WORKSPACE</span><h2>訊息</h2></div><Tooltip title="建立對話"><Button aria-label="建立對話" type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => setCreate(true)}/></Tooltip></div>
      <Input.Search aria-label="搜尋聊天室" placeholder="搜尋對話…" allowClear onChange={event => setSearch(event.target.value)}/>
      <div className="room-list"><ErrorNotice error={rooms.error} retry={() => { void rooms.refetch(); }}/>{rooms.isPending ? <Loading/> : !rooms.data?.length ? <Blank text="建立第一個對話，開始交流"/> : rooms.data.filter(x => x.name.includes(search) || x.members.some(m => m.displayName.includes(search))).map(item => {
        const name = item.kind === 'direct' ? item.members.find(x => x.userId !== user?.id)?.displayName ?? item.name : item.name;
        return <button key={item.id} className={`room-item ${selected === item.id ? 'selected' : ''}`} onClick={() => { setSelected(item.id); setFiles([]); setDraft(''); }}>
          <Avatar className={item.kind === 'group' ? 'group-avatar' : 'person-avatar'} icon={item.kind === 'group' ? <TeamOutlined/> : undefined}>{item.kind === 'direct' ? Array.from(name)[0] : undefined}</Avatar>
          <span className="room-copy"><strong>{name}</strong><small>{item.kind === 'group' ? `${item.members.length} 位成員` : '私人對話'} · {item.lastSequence} 則訊息</small></span><Badge count={item.unreadCount} size="small"/>
        </button>;
      })}</div>
      <button className={`connection-status ${connection}`} onClick={() => setReconnect(x => x + 1)}><WifiOutlined/> {({ online: '即時連線正常', connecting: '正在重新連線…', offline: '即時連線中斷，點擊重試' } as Record<string, string>)[connection]}</button>
    </aside>
    <section className="conversation">
      {!room ? <div className="conversation-welcome"><div className="welcome-icon"><TeamOutlined/></div><h2>讓對話開始流動</h2><p>選擇左側對話，或為您的團隊建立一個新空間。</p><Button type="primary" icon={<PlusOutlined/>} onClick={() => setCreate(true)}>開始新對話</Button></div> : <>
        <header className="conversation-header"><Button className="mobile-back" onClick={() => setSelected(undefined)}>返回</Button><Avatar className="group-avatar" icon={<TeamOutlined/>}/><div><strong>{room.kind === 'direct' ? room.members.find(x => x.userId !== user?.id)?.displayName : room.name}</strong><small><Badge status="success"/> {room.members.filter(x => x.online).length} 人在線 · {room.members.length} 位成員</small></div><Button aria-label="聊天室資訊" icon={<InfoCircleOutlined/>} onClick={() => setDetails(true)}/></header>
        <div className="message-list"><div className="conversation-date">這裡是您的對話紀錄，所有時間依本機時區顯示</div><ErrorNotice error={history.error} retry={() => { void history.refetch(); }}/>
          {history.isPending ? <Loading/> : <>{history.data?.nextCursor && <Button block type="text" onClick={() => { void older(); }}>載入更早的訊息</Button>}{!messages.length && <Blank text="還沒有訊息，打聲招呼吧"/>}{messages.map(item => <article key={item.id} className={`message-row ${item.senderId === user?.id ? 'mine' : ''}`}>
            <Avatar size={32}>{Array.from(item.senderName)[0]}</Avatar><div className="message-content"><div className="message-meta">{item.senderName}<time>{new Date(item.createdAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</time></div>
              <div className={`message-bubble ${item.deleted ? 'deleted' : ''}`}>{item.text}{item.attachments.map(file => <button className="file-card" key={file.id} onClick={() => { void download(file.id, file.fileName).catch(failure => message.error(failure.message)); }}><FileOutlined/><span>{file.fileName}<small>{(Number(file.size) / 1024).toFixed(1)} KB</small></span><PaperClipOutlined/></button>)}</div>
              {item.senderId === user?.id && <small className="read-status"><CheckOutlined/> {room.members.some(x => x.userId !== user.id && Number(x.lastReadSequence) >= Number(item.sequence)) ? '已讀' : '已送出'}</small>}
            </div></article>)}</>}<div ref={end}/></div>
        <div className="composer"><ErrorNotice error={send.error}/><div className="pending-files">{files.map(file => <div className="pending-file" key={file.id}><PaperClipOutlined/> {file.file.name}<Button size="small" type="text" onClick={() => setFiles(old => old.filter(x => x.id !== file.id))}>移除</Button>{file.error ? <Button size="small" danger onClick={() => { void uploadFile(file); }}>重試上傳</Button> : !file.value && <Progress percent={file.progress} size="small"/>}{file.error && <small>{file.error}</small>}</div>)}</div>
          <Input.TextArea aria-label="輸入訊息" placeholder="輸入訊息…" value={draft} maxLength={4000} autoSize={{ minRows: 1, maxRows: 5 }} onChange={event => setDraft(event.target.value)} onPressEnter={event => { if (!event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if ((draft.trim() || files.length) && files.every(x => x.value)) send.mutate(); } }}/>
          <div className="composer-tools"><input aria-label="選擇附件" ref={fileInput} type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf,.txt" hidden onChange={event => { chooseFiles(event.target.files); event.target.value = ''; }}/><Button type="text" icon={<PaperClipOutlined/>} onClick={() => fileInput.current?.click()}>附加檔案</Button><span>Enter 傳送 · Shift + Enter 換行</span><Button type="primary" icon={files.some(x => !x.value && !x.error) ? <LoadingOutlined/> : <SendOutlined/>} loading={send.isPending} disabled={(!draft.trim() && !files.length) || files.some(x => !x.value)} onClick={() => send.mutate()}>傳送</Button></div>
        </div>
      </>}
    </section>
    <Modal title="建立新對話" open={create} onCancel={() => setCreate(false)} footer={null} destroyOnHidden><Form layout="vertical" onFinish={values => createRoom.mutate(values)} requiredMark={false}><Form.Item label="對話類型"><Select value={createKind} onChange={setCreateKind} options={[{ value: 'group', label: '群組聊天室' }, { value: 'direct', label: '一對一私人對話' }]}/></Form.Item>
      {createKind === 'group' && <Form.Item name="name" label="群組名稱" rules={[{ required: true, whitespace: true }]}><Input maxLength={100}/></Form.Item>}
      <Form.Item name={createKind === 'group' ? 'members' : 'userId'} label="邀請成員" rules={createKind === 'direct' ? [{ required: true }] : []}><Select mode={createKind === 'group' ? 'multiple' : undefined} showSearch onSearch={setSearch} filterOption={false} options={profiles.data?.filter(x => x.id !== user?.id).map(x => ({ value: x.id, label: x.displayName }))}/></Form.Item><ErrorNotice error={createRoom.error}/><Button block type="primary" htmlType="submit" loading={createRoom.isPending}>建立對話</Button></Form></Modal>
    <Modal title="聊天室資訊" open={details} onCancel={() => setDetails(false)} footer={null} destroyOnHidden><Typography.Title level={4}>{room?.name}</Typography.Title><p className="muted">{room?.members.length} 位成員</p>
      {user?.role === 'Admin' && <Input.TextArea placeholder="管理操作原因（至少五個字）" value={memberReason} onChange={event => setMemberReason(event.target.value)}/>}
      {room?.members.map(member => <div className="member-row" key={member.userId}><Badge dot color={member.online ? '#39a77a' : '#c3cad5'}><Avatar>{Array.from(member.displayName)[0]}</Avatar></Badge><span>{member.displayName}</span><Role role={member.role}/>
        {canManage && room.kind === 'group' && member.role !== 'Owner' && <Space><Button size="small" onClick={() => { void memberAction(member.userId, member.role === 'Moderator' ? 'Member' : 'Moderator'); }}>調整權限</Button><Button size="small" danger onClick={() => modal.confirm({ title: `移除 ${member.displayName}？`, onOk: () => memberAction(member.userId, 'Member', true) })}>移除</Button></Space>}
        {ownRole === 'Owner' && member.userId !== user?.id && <Button size="small" onClick={() => modal.confirm({ title: '移轉群組擁有權？', onOk: async () => { await api(`/api/v1/chat/rooms/${selected}/owner`, { method: 'PUT', body: JSON.stringify({ userId: member.userId }) }); void queries.invalidateQueries({ queryKey: ['rooms'] }); } })}>移轉擁有權</Button>}</div>)}
      {canManage && room?.kind === 'group' && <Button block icon={<UserAddOutlined/>} onClick={() => setAddMember(true)}>新增成員</Button>}
      {ownRole !== 'Owner' && room?.kind === 'group' && <Button block danger onClick={() => { void memberAction(user!.id, 'Member', true).then(() => { setDetails(false); setSelected(undefined); }); }}>退出群組</Button>}
    </Modal>
    <Modal title="新增成員" open={addMember} onCancel={() => setAddMember(false)} footer={null} destroyOnHidden><Form layout="vertical" initialValues={{ role: 'Member' }} onFinish={values => { void memberAction(values.userId, values.role); }}><Form.Item name="userId" label="會員" rules={[{ required: true }]}><Select showSearch onSearch={setSearch} filterOption={false} options={profiles.data?.filter(x => !room?.members.some(m => m.userId === x.id)).map(x => ({ value: x.id, label: x.displayName }))}/></Form.Item><Form.Item name="role" label="角色"><Select options={[{ value: 'Member', label: '成員' }, { value: 'Moderator', label: '協管員' }]}/></Form.Item><Button type="primary" htmlType="submit">新增</Button></Form></Modal>
  </div>;
}
