import { ActionFunction, json, LoaderFunction, redirect } from 'remix';
import { ApiError } from '~/lib/api';

import { addList, addListItem, deleteListItem, getList, getListItem } from '~/lib/api/lists';
import { List, ListItem } from '~/lib/api/types';

// Types
export type ActionData = {
  error?: string;
  action?: 'addItem' | 'addList' | 'removeItem';
  list?: List;
  listItem?: ListItem;
  fields?: {
    listSlug?: string;
    listName?: string;
  };
};

// Remix
export const action: ActionFunction = async ({ request }) => {
  // Is a user logged in already?
  const headers = new Headers();

  headers.set('Cookie', request.headers.get('Cookie') || '');

  // Retrieve form data
  const form = await request.formData();

  const action = form.get('action');
  const mediaType = form.get('mediaType');
  const tmdbId = form.get('tmdbId');
  const title = form.get('title');
  const subtitle = form.get('subtitle');
  const posterUrl = form.get('posterUrl');

  if (
    typeof action !== 'string' ||
    typeof mediaType !== 'string' ||
    typeof tmdbId !== 'string' ||
    typeof title !== 'string' ||
    typeof subtitle !== 'string' ||
    typeof posterUrl !== 'string'
  ) {
    return json({ error: `Form not submitted correctly.` }, { status: 400 });
  }

  console.log(action);

  switch (action) {
    case 'addItem':
      const addListSlug = form.get('listSlug');

      if (typeof addListSlug !== 'string') {
        return json({ error: `List ID not supplied` }, { status: 400 });
      }

      try {
        const list = await getList(addListSlug, headers);
        const listItem = await addListItem(
          {
            listSlug: list.slug,
            mediaType,
            tmdbId: parseInt(tmdbId),
            title,
            subtitle,
            posterUrl,
          },
          headers
        );

        return json({
          action,
          list,
          listItem,
        });
      } catch (error) {
        const apiError = error as ApiError;

        return json(
          {
            error: apiError.message,
            action,
            fields: { listSlug: addListSlug },
          },
          { status: 400 }
        );
      }
    case 'addList':
      const listName = form.get('listName');

      if (typeof listName !== 'string' || listName.trim() === '') {
        return json({ error: `List name not supplied` }, { status: 400 });
      }

      let newList: List;

      try {
        newList = await addList(listName, headers);
      } catch (error) {
        const apiError = error as ApiError;

        return json(
          {
            error: apiError.message,
            action,
            fields: { listName },
          },
          { status: 400 }
        );
      }

      try {
        const listItem = await addListItem(
          {
            listSlug: newList.slug,
            mediaType,
            tmdbId: parseInt(tmdbId),
            title,
            subtitle,
            posterUrl,
          },
          headers
        );

        return json({
          action,
          list: newList,
          listItem,
        });
      } catch (error) {
        const apiError = error as ApiError;

        return json(
          {
            error: apiError.message,
            action,
            fields: {
              listSlug: newList.slug,
              listName,
            },
          },
          { status: 400 }
        );
      }
    case 'removeItem':
      const removeListSlug = form.get('listSlug');
      const removeListItemId = form.get('listItemId');

      if (typeof removeListSlug !== 'string' || typeof removeListItemId !== 'string') {
        return json({ error: `List and item ID's not suppleid` }, { status: 400 });
      }

      try {
        const list = await getList(removeListSlug, headers);
        const listItem = await getListItem(
          {
            listSlug: removeListSlug,
            listItemId: removeListItemId,
          },
          headers
        );

        await deleteListItem(
          {
            listSlug: removeListSlug,
            listItemId: removeListItemId,
          },
          headers
        );

        return json({
          action,
          list,
          listItem,
        });
      } catch (error) {
        const apiError = error as ApiError;

        return json(
          {
            error: apiError.message,
            action,
          },
          { status: 400 }
        );
      }
    default:
      return json({ error: `Incorrect form action` }, { status: 400 });
  }
};

export const loader: LoaderFunction = async () => {
  return redirect('/lists');
};
