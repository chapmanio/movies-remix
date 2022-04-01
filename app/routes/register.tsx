import { ActionFunction, Form, json, Link, MetaFunction, redirect, useActionData } from 'remix';
import { useState } from 'react';

import Alert from '~/components/assets/Alert';
import HomeHeader from '~/components/layout/HomeHeader';

import { registerUser } from '~/lib/api/auth';
import type { ApiError } from '~/lib/api';

// Types
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
    title: `Create account • Movies`,
  };
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();

  const name = form.get('name');
  const email = form.get('email');
  const password = form.get('password');
  const confirm = form.get('confirm');

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof confirm !== 'string'
  ) {
    return json({ formError: `Form not submitted correctly.` }, { status: 400 });
  }

  if (password !== confirm) {
    return json({ formError: `Passwords do not match` }, { status: 400 });
  }

  const fields = {
    name,
    email,
  };

  try {
    const response = await registerUser({ name, email, password });

    if (!response.ok) {
      // TODO HANDLE THIS
      console.log(response);
    }

    // Bounce home with cookie headers from api
    const headers = new Headers();

    headers.set('Set-Cookie', response.headers.get('Set-Cookie') || '');

    return redirect('/', { headers });
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
};

// React
export default function Register() {
  // Hooks
  const actionData = useActionData<ActionData>();

  // Derived state
  const name = actionData?.fields?.name ?? '';
  const email = actionData?.fields?.email ?? '';

  // Local state
  const [error, setError] = useState<string | undefined>(actionData?.error);

  // Render
  return (
    <>
      <HomeHeader />

      <div className="mx-auto mt-10 max-w-md space-y-8 px-4 sm:px-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign-in to an existing account
            </Link>
          </p>
        </div>

        {error ? <Alert type="error" message={error} onClose={() => setError(undefined)} /> : null}

        <Form method="post" reloadDocument className="mt-8 space-y-6">
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
              className="appearance-nonefocus:outline-none relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Email address"
              defaultValue={email}
            />
          </div>

          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="password"
                required
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
                required
                className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Confirm password"
                defaultValue=""
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Create account
            </button>
          </div>
        </Form>
      </div>
    </>
  );
}
