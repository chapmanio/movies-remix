import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
  useActionData,
  useLoaderData,
} from 'remix';
import { useEffect, useState } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/outline';

import HomeHeader from '~/components/layout/HomeHeader';
import Alert from '~/components/assets/Alert';
import Notification from '../components/assets/Notification';
import Modal from '../components/assets/Modal';

import { AuthUser, authUser, deleteUser, updateUser } from '~/lib/api/auth';
import type { ApiError } from '~/lib/api';

// Types
type LoaderData = {
  authUser: AuthUser;
};

type ActionData = {
  error?: string;
  fields?: {
    name: string;
    email: string;
  };
};

// Remix
export const meta: MetaFunction = () => {
  return {
    title: `My account • Movies`,
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

    return json({ authUser: user });
  } catch (error) {
    return redirect('/sign-in');
  }
};

export const action: ActionFunction = async ({ request }) => {
  // Extract user cookie
  const requestHeaders = new Headers();

  requestHeaders.set('Cookie', request.headers.get('Cookie') || '');

  // Retrieve form
  const form = await request.formData();

  const action = form.get('action');
  const name = form.get('name');
  const email = form.get('email');
  const password = form.get('password');
  const confirm = form.get('confirm');

  if (
    typeof action !== 'string' ||
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof confirm !== 'string'
  ) {
    return json({ formError: `Form not submitted correctly.` }, { status: 400 });
  }

  const fields = {
    name,
    email,
  };

  switch (action) {
    case 'update': {
      // Update the users account
      if (password !== '' && password !== confirm) {
        return json({ formError: `Passwords do not match` }, { status: 400 });
      }

      try {
        const response = await updateUser({ name, email, password }, requestHeaders);

        if (!response.ok) {
          // TODO HANDLE THIS
          console.log(response);
        }

        // Update the cookie header
        const responseHeaders = new Headers();

        responseHeaders.set('Set-Cookie', response.headers.get('Set-Cookie') || '');

        return json({ fields }, { headers: responseHeaders });
      } catch (error) {
        const apiError = error as ApiError;

        return json(
          {
            error: apiError.message,
            fields,
          },
          { status: 400 }
        );
      }
    }
    case 'remove': {
      // Remove the users account
      const response = await deleteUser(email, requestHeaders);

      if (!response.ok) {
        // TODO HANDLE THIS
        console.log(response);
      }

      // Bounce home with cookie headers from api
      const responseHeaders = new Headers();

      responseHeaders.set('Set-Cookie', response.headers.get('Set-Cookie') || '');

      return redirect('/', { headers: responseHeaders });
    }
    default: {
      return json({ formError: `Incorrect form action` }, { status: 400 });
    }
  }
};

// React
export default function MyAccount() {
  // Hooks
  const { authUser } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  // Derived state
  const name = authUser.auth ? authUser.user.name : actionData?.fields?.name ?? '';
  const email = authUser.auth ? authUser.user.email : actionData?.fields?.email ?? '';

  // Local state
  const [showComplete, setShowComplete] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | undefined>(undefined);

  // Effects
  useEffect(() => {
    if (actionData && !actionData.error) {
      setShowComplete(true);
    }
  }, [actionData]);

  // Render
  return (
    <>
      <HomeHeader />

      <div className="mx-auto mt-8 max-w-md space-y-6 px-4 sm:mt-16 sm:px-6">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">My account</h2>

        {error ? <Alert type="error" message={error} onClose={() => setError(undefined)} /> : null}

        <Form id="my-account-form" method="post" reloadDocument={showConfirm} className="space-y-6">
          <div>
            <label htmlFor="name" className="sr-only">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="appearance-nonefocus:outline-none relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Name"
              defaultValue={name}
            />
          </div>

          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="Email address"
              defaultValue={email}
            />
          </div>

          <div className="mt-2 -space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="password"
                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Password"
                defaultValue=""
              />
            </div>
            <div>
              <label htmlFor="confirm" className="sr-only">
                Password
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="confirm-password"
                className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Confirm password"
                defaultValue=""
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              name="action"
              value="update"
              className="group w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Update account
            </button>
          </div>

          <div>
            <button
              type="button"
              className="group w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => setShowConfirm(true)}
            >
              Remove account
            </button>
          </div>
        </Form>
      </div>

      <Notification
        visible={showComplete}
        type="success"
        title="Account updated"
        onClose={() => setShowComplete(false)}
      />

      <Modal title="remove-account-modal" visible={showConfirm} canClose={false}>
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
              Remove account
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to remove your account? All of your data will be permanently
                removed from our servers forever. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            form="my-account-form"
            type="submit"
            name="action"
            value="remove"
            className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Remove
          </button>
          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
            onClick={() => setShowConfirm(false)}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
}
