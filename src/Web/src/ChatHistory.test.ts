import { catchUp, mergeMessages } from './ChatPage';
import { api } from './api/client';
import type { ChatMessage } from './api/models';
vi.mock('./api/client', async original => ({ ...await original<typeof import('./api/client')>(), api: vi.fn() }));
const item = (sequence: number, text = '訊息'): ChatMessage => ({ id: String(sequence), clientMessageId: String(sequence), senderId: 'u', senderName: '會員', sequence, text, deleted: false, createdAt: '', attachments: [] });
beforeEach(() => { vi.mocked(api).mockReset(); });
it('merges duplicate event deliveries and updates existing messages in sequence order', () => { expect(mergeMessages([item(2), item(1)], [item(2, '已移除'), item(3)]).map(x => x.text)).toEqual(['訊息', '已移除', '訊息']); });
it('loads initial history for missing or empty caches', async () => { vi.mocked(api).mockResolvedValue({ items: [item(1)], nextCursor: null }); await catchUp('r'); await catchUp('r', { items: [], nextCursor: null }); expect(api).toHaveBeenCalledTimes(2); });
it('fills multiple missing pages and refreshes recent moderation updates', async () => {
  vi.mocked(api).mockResolvedValueOnce({ items: [item(2)], nextCursor: '2' }).mockResolvedValueOnce({ items: [item(3)], nextCursor: null }).mockResolvedValueOnce({ items: [item(3, '移除紀錄')], nextCursor: null });
  const result = await catchUp('r', { items: [item(1)], nextCursor: 'older' }); expect(result.items.map(x => x.sequence)).toEqual([1, 2, 3]); expect(result.items[2].text).toBe('移除紀錄'); expect(result.nextCursor).toBe('older');
});
it('handles reconnects with no missed messages', async () => { vi.mocked(api).mockResolvedValue({ items: [], nextCursor: null }); expect((await catchUp('r', { items: [item(1)], nextCursor: null })).items).toHaveLength(1); });
