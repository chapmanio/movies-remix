import { Form, json, LoaderFunction, useLoaderData, useSearchParams, useSubmit } from 'remix';
import { useEffect, useRef } from 'react';
import type { SearchMultiResponse } from 'moviedb-promise/dist/request-types';

import HomeHeader from '~/components/layout/HomeHeader';
import TabButton from '~/components/search/TabButton';

import { searchMovie } from '~/lib/api/movie';
import { searchPerson } from '~/lib/api/person';
import { getTrending, searchAll } from '~/lib/api/search';
import { searchTv } from '~/lib/api/tvShow';
import {
  formatSearchAll,
  formatSearchMovie,
  formatSearchPerson,
  formatSearchTvShow,
  ListItem as ListItemType,
} from '~/lib/format';
import ListItem from '~/components/lists/ListItem';
import Pagination from '~/components/search/Pagination';

// Types
type Tab = 'all' | 'movie' | 'tv' | 'person';

type LoaderData = {
  searchResults: SearchMultiResponse;
  formattedResults: ListItemType[];
};

// Remix
export const loader: LoaderFunction = async ({ request }) => {
  // Handle query params
  const url = new URL(request.url);

  const search = url.searchParams.get('search') || '';
  const tab = (url.searchParams.get('tab') || 'all') as Tab;
  const page = parseInt(url.searchParams.get('page') || '1');

  // Get search results
  let searchResults: SearchMultiResponse;
  let formattedResults: ListItemType[] = [];

  if (search && search.trim() !== '') {
    switch (tab) {
      case 'all':
        const all = await searchAll({
          query: search,
          page,
        });

        searchResults = all;
        formattedResults = formatSearchAll(all);

        break;
      case 'movie':
        const movies = await searchMovie({
          query: search,
          page,
        });

        searchResults = movies;
        formattedResults = formatSearchMovie(movies);

        break;
      case 'tv':
        const tvShows = await searchTv({
          query: search,
          page,
        });

        searchResults = tvShows;
        formattedResults = formatSearchTvShow(tvShows);

        break;
      case 'person':
        const people = await searchPerson({
          query: search,
          page,
        });

        searchResults = people;
        formattedResults = formatSearchPerson(people);

        break;
      default:
        throw new Response(`The only available tab values are 'all', 'movie', 'tv' or 'person'`, {
          status: 400,
        });
    }
  } else {
    // Default to trending today
    const trending = await getTrending();

    searchResults = trending;
    formattedResults = formatSearchAll(trending);
  }

  // Handle response
  const data: LoaderData = {
    searchResults,
    formattedResults,
  };

  return json(data);
};

// React
export default function Index() {
  // Hooks
  const { searchResults, formattedResults } = useLoaderData<LoaderData>();
  const [searchParams] = useSearchParams();
  const submit = useSubmit();

  // Derived state
  const search = searchParams.get('search') || '';
  const tab = (searchParams.get('tab') || 'all') as Tab;
  const page = parseInt(searchParams.get('page') || '1');

  // Refs
  const mountedRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const tabRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    if (mountedRef.current && tabRef.current) {
      tabRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    mountedRef.current = true;
  }, [searchParams]);

  // Render
  return (
    <>
      <HomeHeader />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mx-auto mt-5 max-w-xl text-center text-xl text-gray-500">
          Supported by a{` `}
          <a
            href="https://workers.cloudflare.com/"
            rel="nofollow noreferrer"
            className="font-semibold hover:text-indigo-600"
          >
            Cloudflare workers
          </a>{' '}
          hosted API, connecting to a{' '}
          <a
            href="https://www.prisma.io/"
            rel="nofollow noreferrer"
            className="font-semibold hover:text-indigo-600"
          >
            Prisma
          </a>
          -managed database and interacting with{' '}
          <a
            href="https://developers.themoviedb.org/"
            rel="nofollow noreferrer"
            className="font-semibold hover:text-indigo-600"
          >
            The Movie Database
          </a>{' '}
          external API.
        </p>

        <Form method="get" name="searchForm" ref={formRef}>
          <div className="mx-auto mt-16 max-w-4xl rounded-xl bg-indigo-600 px-4 py-4 sm:flex sm:py-9 sm:px-12">
            <div className="min-w-0 flex-1">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <input
                id="search"
                name="search"
                defaultValue={search || ''}
                type="search"
                className="block w-full rounded-md border border-transparent px-5 py-3 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                placeholder="Search for a movie, tv show or person..."
              />
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-3">
              <button
                type="submit"
                className="block w-full rounded-md border border-transparent bg-indigo-500 px-5 py-3 text-base font-medium text-white shadow hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700 sm:px-10"
              >
                Search
              </button>
            </div>
          </div>

          <div className="mt-16" ref={tabRef}>
            {search.trim() === '' ? (
              <div className="border-b border-gray-200 pb-5">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Trending today</h3>
              </div>
            ) : (
              <>
                <div className="sm:hidden">
                  <label htmlFor="tab" className="sr-only">
                    Select a tab
                  </label>
                  <select
                    id="tab"
                    name="tab"
                    className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    defaultValue={tab}
                    onChange={() => submit(formRef.current)}
                  >
                    <option value="all">All</option>
                    <option value="movie">Movie</option>
                    <option value="tv">TV Show</option>
                    <option value="person">Person</option>
                  </select>
                </div>
                <div className="hidden sm:block">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                      <TabButton current={tab === 'all'} value="all">
                        All
                      </TabButton>

                      <TabButton current={tab === 'movie'} value="movie">
                        Movie
                      </TabButton>

                      <TabButton current={tab === 'tv'} value="tv">
                        TV Show
                      </TabButton>

                      <TabButton current={tab === 'person'} value="person">
                        Person
                      </TabButton>
                    </nav>
                  </div>
                </div>
              </>
            )}

            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 lg:grid-cols-5 lg:gap-x-8 xl:gap-x-12">
              {formattedResults.map((result) => (
                <li key={result.tmdbId} className="relative">
                  <ListItem item={result} action="add" />
                </li>
              ))}
            </ul>

            {search && searchResults.total_pages && searchResults.total_pages > 1 ? (
              <Pagination currentPage={page} totalPages={searchResults.total_pages} />
            ) : null}
          </div>
        </Form>
      </div>
    </>
  );
}
