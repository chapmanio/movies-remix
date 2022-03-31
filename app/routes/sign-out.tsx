import { redirect } from 'remix';
import type { ActionFunction, LoaderFunction } from 'remix';

import { signOut } from '~/lib/api/auth';

export const action: ActionFunction = async () => {
  const response = await signOut();

  if (!response.ok) {
    console.log(response);
  }

  // TODO: Can we update global state before we bounce along?

  // Bounce home with cookie headers from api
  return redirect('/', { headers: response.headers });
};

export const loader: LoaderFunction = async () => {
  return redirect('/');
};
