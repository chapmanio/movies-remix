import {
  json,
  Links,
  LinksFunction,
  LiveReload,
  LoaderFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'remix';
import type { MetaFunction } from 'remix';

import Footer from './components/layout/Footer';
import ListModal from './components/lists/ListModal';

import { ListProvider } from './hooks/useList';
import { ListModalProvider } from './hooks/useListModal';
import { UserProvider } from './hooks/useUser';

import { authUser, AuthUser } from './lib/api/auth';
import { getAllLists } from './lib/api/lists';
import type { List } from './lib/api/types';

import styles from './tailwind.css';

// Types
type LoaderData = {
  authUser: AuthUser;
  lists: List[] | undefined;
};

// Remix
export const loader: LoaderFunction = async ({ request }) => {
  // Build headers with any cookies
  const headers = new Headers();

  headers.set('Cookie', request.headers.get('Cookie') || '');

  // Get logged in user
  let user: AuthUser;

  try {
    user = await authUser(headers);
  } catch (error) {
    user = { auth: false };
  }

  // Get lists if logged in
  let lists: List[] | undefined;

  if (user.auth) {
    lists = await getAllLists(headers);
  }

  // Handle response
  const data: LoaderData = {
    authUser: user,
    lists,
  };

  return json(data);
};

export const links: LinksFunction = () => {
  return [
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      sizes: '32x3',
      href: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      sizes: '16x16',
      href: '/favicon-16x16.png',
    },
    {
      rel: 'manifest',
      href: '/site.webmanifest',
    },
    {
      rel: 'stylesheet',
      href: styles,
    },
  ];
};

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Movies',
  viewport: 'width=device-width,initial-scale=1',
});

// React
export default function App() {
  // Hooks
  const { authUser, lists } = useLoaderData<LoaderData>();

  // Render
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <UserProvider initialState={authUser}>
          <ListProvider initialState={{ lists }}>
            <ListModalProvider>
              <Outlet />

              <Footer />
              <ListModal />
            </ListModalProvider>
          </ListProvider>
        </UserProvider>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
