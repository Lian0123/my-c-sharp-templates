// Generated API aliases. Run npm run generate:api after exporting OpenAPI.
import type { components as Auth, paths as AuthPaths } from './generated/auth';
import type { components as Account } from './generated/account';
import type { components as Message } from './generated/message';
export type User = Auth['schemas']['UserView'];
export type Login = Auth['schemas']['LoginResult'];
export type Profile = Account['schemas']['ProfileView'];
export type Member = Message['schemas']['MemberView'];
export type Room = Message['schemas']['RoomView'];
export type Attachment = Message['schemas']['AttachmentView'];
export type ChatMessage = Message['schemas']['MessageView'];
export type Page<T> = Omit<Message['schemas']['PageOfMessageView'], 'items'> & { items: T[] };
export type Audit = Auth['schemas']['AuditView'];
type Failure = AuthPaths['/api/v1/auth/login']['post']['responses'][400]['content']['application/problem+json'];
export type Problem = Pick<Failure, 'status' | 'title' | 'detail' | 'errorCode' | 'traceId' | 'errors'>;
