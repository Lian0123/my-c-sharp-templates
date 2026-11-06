import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, csrf, download, logout, post, refresh, session, token, upload, uuid } from './client';
import type { Login } from './models';
const login: Login = { accessToken: 'jwt', expiresIn: 300, csrfToken: 'csrf', user: { id: 'u', displayName: '會員', email: 'u@example.com', role: 'User', active: true, emailVerified: true, createdAt: '' } };
const problem = { status: 403, title: '禁止', detail: '權限不足', errorCode: '4030001', traceId: 'trace' };
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
describe('HTTP client', () => {
  beforeEach(() => { session(null); document.cookie = 'csrf_token=csrf; Path=/'; vi.stubGlobal('fetch', vi.fn()); });
  afterEach(() => { vi.unstubAllGlobals(); });
  it('keeps access tokens in memory and includes bearer and CSRF headers', async () => {
    session(login); expect(token()).toBe('jwt'); expect(csrf()).toBe('csrf');
    vi.mocked(fetch).mockResolvedValue(json({ ok: true }));
    expect(await post('/api/test', { name: '測試' })).toEqual({ ok: true });
    const init = vi.mocked(fetch).mock.calls[0][1]!; const headers = init.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer jwt'); expect(headers.get('X-CSRF-Token')).toBe('csrf'); expect(headers.get('Content-Type')).toBe('application/json');
    expect(init.credentials).toBe('same-origin');
  });
  it('handles missing CSRF cookies and requests without tokens or content bodies', async () => {
    document.cookie = 'csrf_token=; Max-Age=0; Path=/'; expect(csrf()).toBe('');
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));
    expect(await post('/api/test')).toBeUndefined(); expect((vi.mocked(fetch).mock.calls[0][1]!.headers as Headers).has('Authorization')).toBe(false);
  });
  it('generates RFC 4122 identifiers in secure and plain HTTP contexts', () => {
    expect(uuid()).toMatch(/^[a-f0-9-]{36}$/);
    vi.stubGlobal('crypto', { getRandomValues: (value: Uint8Array) => value.fill(0) });
    expect(uuid()).toBe('00000000-0000-4000-8000-000000000000');
  });
  it('does not add JSON content types to multipart forms', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('', { headers: { 'content-length': '0' } }));
    await api('/api/test', { method: 'POST', body: new FormData() });
    expect((vi.mocked(fetch).mock.calls[0][1]!.headers as Headers).has('Content-Type')).toBe(false);
  });
  it('handles empty successful responses', async () => { vi.mocked(fetch).mockResolvedValue(new Response('')); expect(await api('/empty')).toBeUndefined(); });
  it('preserves structured errors and falls back for non-JSON errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(json(problem, 403)).mockResolvedValueOnce(new Response('upstream failed', { status: 502 }));
    await expect(api('/a')).rejects.toMatchObject({ message: '權限不足', problem });
    await expect(api('/b')).rejects.toMatchObject({ problem: { errorCode: '5020001', title: '連線失敗' } });
    expect(new ApiError({ ...problem, detail: '' }).message).toBe('禁止');
  });
  it('shares one refresh request across simultaneous callers', async () => {
    vi.mocked(fetch).mockResolvedValue(json(login)); const a = refresh(); const b = refresh(); expect(a).toBe(b);
    await expect(a).resolves.toEqual(login); expect(fetch).toHaveBeenCalledTimes(1); expect(token()).toBe('jwt');
  });
  it('refreshes once and retries protected API requests', async () => {
    session(login); vi.mocked(fetch).mockResolvedValueOnce(json(problem, 401)).mockResolvedValueOnce(json(login)).mockResolvedValueOnce(json({ items: [] }));
    expect(await api('/api/v1/chat/rooms')).toEqual({ items: [] }); expect(fetch).toHaveBeenCalledTimes(3);
  });
  it('does not retry indefinitely or refresh auth endpoints', async () => {
    session(login); vi.mocked(fetch).mockResolvedValue(json(problem, 401));
    await expect(api('/api/v1/auth/login')).rejects.toBeInstanceOf(ApiError); expect(fetch).toHaveBeenCalledTimes(1);
    await expect(api('/api/v1/chat/rooms', {}, false)).rejects.toBeInstanceOf(ApiError); expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('clears local access on a failed refresh and propagates failures', async () => {
    session(login); vi.mocked(fetch).mockResolvedValue(json(problem, 401)); await expect(refresh()).rejects.toBeInstanceOf(ApiError); expect(token()).toBe('');
  });
  it('clears local session only after a successful logout', async () => {
    session(login); vi.mocked(fetch).mockResolvedValueOnce(json(problem, 503)); await expect(logout()).rejects.toBeInstanceOf(ApiError); expect(token()).toBe('jwt');
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 })); await logout(); expect(token()).toBe('');
  });
  it('waits for an in-flight refresh before logging out', async () => {
    session(login);
    let complete!: (response: Response) => void;
    vi.mocked(fetch).mockImplementationOnce(() => new Promise(resolve => { complete = resolve; }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const renewing = refresh(); const leaving = logout(); expect(fetch).toHaveBeenCalledTimes(1);
    complete(json(login)); await renewing; await leaving;
    expect(fetch).toHaveBeenCalledTimes(2); expect(token()).toBe('');
  });
  it('downloads through an authorized URL and releases object URLs', async () => {
    session(login); const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    URL.createObjectURL = vi.fn(() => 'blob:test'); URL.revokeObjectURL = vi.fn(); vi.mocked(fetch).mockImplementation(async () => new Response('file'));
    await download('a', '附件.txt', '管理查閱原因'); expect(vi.mocked(fetch).mock.calls[0][0]).toContain('reason='); expect(click).toHaveBeenCalled(); expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
    await download('b', 'file.txt'); expect(vi.mocked(fetch).mock.calls[1][0]).toBe('/api/v1/chat/attachments/b');
  });
  it('surfaces denied downloads', async () => { vi.mocked(fetch).mockResolvedValue(json(problem, 403)); await expect(download('a', 'a')).rejects.toBeInstanceOf(ApiError); });
});

describe('upload transport', () => {
  class FakeXHR {
    static last: FakeXHR; status = 200; responseText = '{}'; upload: { onprogress?: (event: ProgressEvent) => void } = {};
    onload?: () => void; onerror?: () => void; open = vi.fn(); setRequestHeader = vi.fn(); send = vi.fn();
    constructor() { FakeXHR.last = this; }
  }
  beforeEach(() => { vi.stubGlobal('XMLHttpRequest', FakeXHR); });
  afterEach(() => { vi.unstubAllGlobals(); });
  it('reports progress and returns attachment metadata', async () => {
    const progress = vi.fn(); const task = upload('r', new File(['x'], 'a.txt'), progress); const xhr = FakeXHR.last;
    xhr.upload.onprogress!({ lengthComputable: false } as ProgressEvent); expect(progress).not.toHaveBeenCalled();
    xhr.upload.onprogress!({ lengthComputable: true, loaded: 1, total: 2 } as ProgressEvent); expect(progress).toHaveBeenCalledWith(50);
    xhr.responseText = '{"id":"a"}'; xhr.onload!(); await expect(task).resolves.toEqual({ id: 'a' });
  });
  it('rejects structured upload errors, malformed responses and network failures', async () => {
    const file = new File(['x'], 'a.txt');
    const denied = upload('r', file, vi.fn()); FakeXHR.last.status = 415; FakeXHR.last.responseText = JSON.stringify(problem); FakeXHR.last.onload!(); await expect(denied).rejects.toBeInstanceOf(ApiError);
    const malformed = upload('r', file, vi.fn()); FakeXHR.last.responseText = 'bad'; FakeXHR.last.onload!(); await expect(malformed).rejects.toThrow('回應不正確');
    const network = upload('r', file, vi.fn()); FakeXHR.last.onerror!(); await expect(network).rejects.toThrow('上傳失敗');
  });
});
