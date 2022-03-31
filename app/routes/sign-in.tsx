import { ActionFunction, Form, json, Link, MetaFunction, redirect, useActionData } from 'remix';
import { useState } from 'react';
import { LockClosedIcon } from '@heroicons/react/solid';

import Alert from '~/components/assets/Alert';
import HomeHeader from '~/components/layout/HomeHeader';

import { signIn } from '~/lib/api/auth';
import type { ApiError } from '~/lib/api';

// Types
type ActionData = {
  error?: string;
  fields?: {
    email: string;
    password: string;
  };
};

// Remix
export const meta: MetaFunction = () => {
  return {
    title: `Sign In • Movies`,
  };
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();

  const email = form.get('email');
  const password = form.get('password');

  if (typeof email !== 'string' || typeof password !== 'string') {
    return json({ formError: `Form not submitted correctly.` }, { status: 400 });
  }

  const fields = {
    email,
    password,
  };

  try {
    const response = await signIn({ email, password });

    if (!response.ok) {
      console.log(response);
    }

    // TODO: Can we update global state before we bounce along?

    // Bounce home with cookie headers from api
    return redirect('/', { headers: response.headers });
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
export default function SignIn() {
  // Hooks
  const actionData = useActionData<ActionData>();
  // Derived state
  const email = actionData?.fields?.email ?? '';
  const password = actionData?.fields?.password ?? '';

  // Local state
  const [error, setError] = useState<string | undefined>(actionData?.error);

  // Render
  return (
    <>
      <HomeHeader />

      <div className="mx-auto mt-10 max-w-md space-y-8 px-4 sm:px-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
              prefetch="intent"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* TODO */}
        {error ? <Alert type="error" message={error} onClose={() => setError(undefined)} /> : null}

        <Form method="post" className="mt-8 space-y-6">
          <div className="-space-y-px rounded-md shadow-sm">
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
                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Email address"
                defaultValue={email}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Password"
                defaultValue={password}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <LockClosedIcon
                  className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                  aria-hidden="true"
                />
              </span>
              Sign in
            </button>
          </div>
        </Form>
      </div>
    </>
  );
}
