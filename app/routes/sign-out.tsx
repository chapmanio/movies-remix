import { redirect } from 'remix';
import type { ActionFunction, LoaderFunction } from 'remix';

import { signOut } from '~/lib/api/auth';

export const action: ActionFunction = async () => {
  const response = await signOut();

  if (!response.ok) {
    // TODO: Handle this
    console.log(response);
  }

  // Bounce home with cookie headers from api
  const headers = new Headers();

  headers.set('Set-Cookie', response.headers.get('Set-Cookie') || '');

  return redirect('/', { headers });
};

export const loader: LoaderFunction = async () => {
  return redirect('/');
};
