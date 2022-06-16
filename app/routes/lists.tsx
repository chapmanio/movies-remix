import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
  useActionData,
} from 'remix';
import { useCallback, useEffect, useRef, useState } from 'react';

import DetailsHeader from '~/components/layout/DetailsHeader';
import List from '~/components/lists/List';
import Alert from '~/components/assets/Alert';
import Notification, { NotificationProps } from '../components/assets/Notification';

import { useListDispatch, useListState } from '../hooks/useList';

import { addList, deleteList, updateList } from '../lib/api/lists';
import type { List as ListType } from '../lib/api/types';
import type { ApiError } from '../lib/api';
import { authUser } from '../lib/api/auth';

// Types
type ActionData = {
  error?: string;
  fields?: {
    slug: string;
    name: string;
  };
  list?: ListType;
  confirm?: 'added' | 'updated' | 'removed';
};

type Confirm = Omit<NotificationProps, 'onClose'>;

// Remix
export const meta: MetaFunction = () => {
  return {
    title: `My lists • Movies`,
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  // Is a user logged in already?
  const headers = new Headers();

  headers.set('Cookie', request.headers.get('Cookie') || '');

  try {
    const user = await authUser(headers);

    if (!user.auth) {
      return redirect('/sign-in');
    }

    return new Response();
  } catch (error) {
    return redirect('/sign-in');
  }
};

export const action: ActionFunction = async ({ request }) => {
  // Extract user cookie
  const requestHeaders = new Headers();

  requestHeaders.set('Cookie', request.headers.get('Cookie') || '');

  // First, check if it's a remove request
  const form = await request.formData();

  const remove = form.get('remove');

  if (remove && typeof remove === 'string') {
    if (remove.trim() === '') {
      return json({ formError: `Missing list url` }, { status: 400 });
    }

    // Remove the list
    try {
      const removedList = await deleteList(remove, requestHeaders);

      return json({
        confirm: 'removed',
        list: removedList,
      });
    } catch (error) {
      const apiError = error as ApiError;

      const response: ActionData = { error: apiError.message };

      return json(response, { status: apiError.status });
    }
  } else {
    // Retrieve add/update form details
    const action = form.get('action');
    const slug = form.get('slug');
    const name = form.get('name');

    if (typeof action !== 'string' || typeof slug !== 'string' || typeof name !== 'string') {
      return json({ formError: `Form not submitted correctly.` }, { status: 400 });
    }

    switch (action) {
      case 'add': {
        // Create the new list
        try {
          const newList = await addList(name, requestHeaders);

          return json({
            confirm: 'added',
            list: newList,
          });
        } catch (error) {
          const apiError = error as ApiError;

          const response: ActionData = {
            error: apiError.message,
            fields: {
              slug,
              name,
            },
          };

          return json(response, { status: apiError.status });
        }
      }
      case 'update': {
        if (slug.trim() === '') {
          return json({ formError: `Missing the current list url` }, { status: 400 });
        }

        // Update the list
        try {
          const updatedList = await updateList({ slug, name }, requestHeaders);

          return json({
            confirm: 'updated',
            list: updatedList,
          });
        } catch (error) {
          const apiError = error as ApiError;

          const response: ActionData = {
            error: apiError.message,
            fields: {
              slug,
              name,
            },
          };

          return json(response, { status: apiError.status });
        }
      }
      default: {
        return json({ formError: `Incorrect form action` }, { status: 400 });
      }
    }
  }
};

// React
export default function Lists() {
  // Hooks
  const actionData = useActionData<ActionData>();
  const listState = useListState();
  const listDispatch = useListDispatch();

  // Local state
  const [slug, setSlug] = useState<string | undefined>(undefined);
  const [name, setName] = useState('');

  const [confirm, setConfirm] = useState<Confirm>({
    type: 'success',
    title: '',
    visible: false,
  });
  const [error, setError] = useState<string | undefined>(undefined);

  // Refs
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Callbacks
  const actionComplete = useCallback((message: string) => {
    // Scroll to the top
    if (titleRef.current) {
      titleRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    // Clear the form
    setSlug(undefined);
    setName('');

    // Show the notification
    setConfirm((confirm) => ({
      ...confirm,
      visible: true,
      title: message,
    }));
  }, []);

  // Effects
  useEffect(() => {
    if (actionData?.error) {
      setError(actionData.error);
    } else if (actionData?.confirm) {
      setError(undefined);
      setSlug(undefined);
      setName('');

      if (actionData.confirm === 'updated') {
        if (actionData.list) {
          listDispatch({
            type: 'UPDATE_LIST',
            slug: actionData.list.slug,
            list: actionData.list,
          });
        }

        actionComplete('List updated');
      } else if (actionData.confirm === 'removed') {
        if (actionData.list) {
          listDispatch({
            type: 'REMOVE_LIST',
            slug: actionData.list.slug,
          });
        }

        actionComplete('List removed');
      } else {
        if (actionData.list) {
          listDispatch({
            type: 'ADD_LIST',
            list: actionData.list,
          });
        }

        actionComplete('List added');
      }
    }
  }, [actionData, actionComplete, listDispatch]);

  // Handlers
  const handleCancel = () => {
    setSlug(undefined);
    setName('');
  };

  const handleEdit = (list: ListType) => {
    if (titleRef.current) {
      titleRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    setName(list.name);
    setSlug(list.slug);
  };

  // Render
  console.log('render', listState.lists);

  return (
    <>
      <DetailsHeader />

      <div className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900" ref={titleRef}>
          My lists
        </h2>

        {error ? (
          <div className="mt-5">
            <Alert type="error" message={error} onClose={() => setError(undefined)} />
          </div>
        ) : null}

        <Form id="list-form" method="post" className="mt-5 sm:flex sm:items-center">
          <input
            type="hidden"
            name="slug"
            value={slug || ''}
            onChange={(e) => setSlug(e.target.value)}
          />

          <div className="w-full sm:max-w-xs">
            <label htmlFor="email" className="sr-only">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="List name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button
            type="submit"
            name="action"
            value={slug ? `update` : `add`}
            className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {slug ? `Edit list` : `Create list`}
          </button>

          {slug ? (
            <button
              type="button"
              className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleCancel}
            >
              Cancel
            </button>
          ) : null}
        </Form>

        {listState.lists.map((list) => (
          <div key={list.id} className="mt-10">
            <List list={list} formId="list-form" onEdit={() => handleEdit(list)} />
          </div>
        ))}
      </div>

      <Notification
        {...confirm}
        onClose={() => setConfirm((confirm) => ({ ...confirm, visible: false }))}
      />
    </>
  );
}
