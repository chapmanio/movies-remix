import { apiFetch, apiRaw } from '../api';
import type { List, ListItem } from './types';

// Types
type UpdateListArgs = {
  slug: string;
  name: string;
};

type AddListItemArgs = {
  listId: string;
  mediaType: string;
  tmdbId: number;
  title: string;
  subtitle?: string;
  posterUrl?: string;
};

type DeleteListItemArgs = {
  listId: string;
  listItemId: string;
};

// Handlers
export const getAllLists = async (headers?: HeadersInit) => {
  return apiFetch<List[]>(`/list`, { headers });
};

export const getList = async (slug: string) => {
  return apiFetch<List>(`/list/${slug}`);
};

export const addList = async (name: string, headers?: HeadersInit) => {
  return apiFetch<List>(`/list`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name,
    }),
  });
};

export const updateList = async ({ slug, name }: UpdateListArgs, headers?: HeadersInit) => {
  return apiFetch<List>(`/list/${slug}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name,
    }),
  });
};

export const deleteList = async (slug: string, headers?: HeadersInit) => {
  return apiFetch<List>(`/list/delete/${slug}`, {
    method: 'POST',
    headers,
  });
};

export const addListItem = async ({
  listId,
  mediaType,
  tmdbId,
  title,
  subtitle,
  posterUrl,
}: AddListItemArgs) => {
  return apiFetch<ListItem>(`/list-item/${listId}`, {
    method: 'POST',
    body: JSON.stringify({
      mediaType,
      tmdbId,
      title,
      subtitle,
      posterUrl,
    }),
  });
};

export const deleteListItem = async ({ listId, listItemId }: DeleteListItemArgs) => {
  await apiRaw(`/list-item/${listId}/delete/${listItemId}`, {
    method: 'POST',
  });

  return;
};
