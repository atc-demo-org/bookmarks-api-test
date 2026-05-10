import { randomUUID } from 'crypto';
import { Bookmark, CreateBookmarkInput } from './types';

const bookmarks = new Map<string, Bookmark>();

export function createBookmark(input: CreateBookmarkInput): Bookmark {
  const bookmark: Bookmark = {
    id: randomUUID(),
    url: input.url,
    title: input.title,
    tags: input.tags ?? [],
    createdAt: new Date().toISOString(),
  };
  bookmarks.set(bookmark.id, bookmark);
  return bookmark;
}

export function listBookmarks(tag?: string): Bookmark[] {
  let items = Array.from(bookmarks.values());
  if (tag !== undefined) {
    const lower = tag.toLowerCase();
    items = items.filter((b) =>
      b.tags.some((t) => t.toLowerCase() === lower),
    );
  }
  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getBookmark(id: string): Bookmark | undefined {
  return bookmarks.get(id);
}

export function deleteBookmark(id: string): boolean {
  return bookmarks.delete(id);
}

export function clearAll(): void {
  bookmarks.clear();
}
