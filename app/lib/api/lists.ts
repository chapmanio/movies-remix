import { apiFetch, apiRaw } from '../api';
import type { List, ListItem } from './types';

// Types
type UpdateListArgs = {
  slug: string;
  name: string;
};

type AddListItemArgs = {
  listSlug: string;
  mediaType: string;
  tmdbId: number;
  title: string;
  subtitle?: string;
  posterUrl?: string;
};

type GetListItemArgs = {
  listSlug: string;
  listItemId: string;
};

type DeleteListItemArgs = {
  listSlug: string;
  listItemId: string;
};

// Handlers
export const getAllLists = async (headers?: HeadersInit) => {
  return apiFetch<List[]>(`/list`, { headers });
};

export const getList = async (slug: string, headers?: HeadersInit) => {
  return apiFetch<List>(`/list/${slug}`, { headers });
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

export const getListItem = async (
  { listSlug, listItemId }: GetListItemArgs,
  headers?: HeadersInit
) => {
  return apiFetch<ListItem>(`/list-item/${listSlug}/${listItemId}`, { headers });
};

export const addListItem = async (
  { listSlug, mediaType, tmdbId, title, subtitle, posterUrl }: AddListItemArgs,
  headers?: HeadersInit
) => {
  return apiFetch<ListItem>(`/list-item/${listSlug}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      mediaType,
      tmdbId,
      title,
      subtitle,
      posterUrl,
    }),
  });
};

export const deleteListItem = async (
  { listSlug, listItemId }: DeleteListItemArgs,
  headers?: HeadersInit
) => {
  await apiRaw(`/list-item/${listSlug}/delete/${listItemId}`, {
    method: 'POST',
    headers,
  });

  return;
};
