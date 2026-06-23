export interface Bookmark {
  id: string;
  url: string;
  title: string;
  tags: string[];
  createdAt: string;
}

export interface CreateBookmarkInput {
  url: string;
  title: string;
  tags?: string[];
}

export interface UpdateBookmarkInput {
  title?: string;
  tags?: string[];
}
