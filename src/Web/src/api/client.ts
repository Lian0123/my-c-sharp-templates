import type { Login, Problem } from './models';

let accessToken = '';
let refreshFlight: Promise<Login> | null = null;
export const sessionEvents = new EventTarget();
export function token() { return accessToken; }
export function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
export function csrf() { return document.cookie.split('; ').find(x => x.startsWith('csrf_token='))?.slice('csrf_token='.length) ?? ''; }
export function session(login: Login | null) {
  accessToken = login?.accessToken ?? '';
  sessionEvents.dispatchEvent(new CustomEvent('change', { detail: login }));
}
export class ApiError extends Error {
  constructor(public problem: Problem) { super(problem.detail || problem.title); }
}
async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const problem = await response.json().catch(() => ({ status: response.status, title: '連線失敗', detail: '請稍後重試', errorCode: `${response.status}0001`, traceId: '' }));
    throw new ApiError(problem);
  }
  if (response.status === 204 || response.headers.get('content-length') === '0') return undefined as T;
  const body = await response.text();
  return (body ? JSON.parse(body) : undefined) as T;
}
export function refresh(): Promise<Login> {
  if (!refreshFlight) {
    refreshFlight = fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'same-origin', headers: { 'X-CSRF-Token': csrf() } })
      .then(parse<Login>).then(login => { session(login); return login; })
      .catch(error => { session(null); throw error; }).finally(() => { refreshFlight = null; });
  }
  return refreshFlight;
}
export async function api<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(options.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  headers.set('X-CSRF-Token', csrf());
  const response = await fetch(path, { ...options, credentials: 'same-origin', headers });
  if (response.status === 401 && retry && accessToken && !path.startsWith('/api/v1/auth/')) {
    await refresh(); return api<T>(path, options, false);
  }
  return parse<T>(response);
}
export function post<T>(path: string, body?: unknown) { return api<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }); }
export async function logout() { if (refreshFlight) await refreshFlight; await post('/api/v1/auth/logout'); session(null); }
export async function download(id: string, fileName: string, reason?: string) {
  const response = await fetch(`/api/v1/chat/attachments/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) { await parse(response); return; }
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a'); link.href = url; link.download = fileName; link.click(); URL.revokeObjectURL(url);
}
export async function upload(roomId: string, file: File, progress: (value: number) => void) {
  return new Promise<import('./models').Attachment>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/v1/chat/rooms/${roomId}/attachments`);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.upload.onprogress = e => { if (e.lengthComputable) progress(Math.round(e.loaded / e.total * 100)); };
    xhr.onerror = () => reject(new Error('附件上傳失敗，請重試'));
    xhr.onload = () => {
      try { const result = JSON.parse(xhr.responseText); if (xhr.status >= 200 && xhr.status < 300) resolve(result); else reject(new ApiError(result)); }
      catch { reject(new Error('附件服務回應不正確')); }
    };
    const form = new FormData(); form.append('file', file); xhr.send(form);
  });
}
