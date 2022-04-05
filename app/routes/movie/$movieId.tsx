import { LoaderFunction, MetaFunction, useLoaderData } from 'remix';
import type { CreditsResponse, MovieResponse } from 'moviedb-promise/dist/request-types';
import { CalendarIcon, ClockIcon, FilmIcon, PlusSmIcon } from '@heroicons/react/solid';

import DetailsHeader from '~/components/layout/DetailsHeader';
import Rating from '~/components/assets/Rating';
import ListItem from '~/components/lists/ListItem';

import { getMovieCredits, getMovie } from '../../lib/api/movie';
import { formatRuntime, formatShortDate, formatYear } from '../../lib/dates';
import { formatMovie } from '../../lib/format';
import { useListModalDispatch } from '~/hooks/useListModal';

// Types
type LoaderData = {
  movie: MovieResponse;
  credits: CreditsResponse;
};

// Remix
export const loader: LoaderFunction = async ({ params }) => {
  if (!params.movieId) {
    throw new Response(`No 'movieId' found`, {
      status: 400,
    });
  }

  const movie = await getMovie({
    id: parseInt(params.movieId),
  });

  const credits = await getMovieCredits({
    id: parseInt(params.movieId),
  });

  const data: LoaderData = {
    movie,
    credits,
  };

  return data;
};

export const meta: MetaFunction = ({ data }) => {
  if (data) {
    const { movie } = data as LoaderData;

    return {
      title: `${movie.title} • Movies`,
    };
  } else {
    return {
      title: `Movies`,
    };
  }
};

// React
export default function Movie() {
  // Hooks
  const { movie, credits } = useLoaderData<LoaderData>();
  const listModalDispatch = useListModalDispatch();

  // Render
  return (
    <>
      <DetailsHeader />

      <div
        className="bg-cover bg-right-top bg-no-repeat sm:bg-[right_-200px_top]"
        style={{
          backgroundImage: movie.backdrop_path
            ? `url(https://www.themoviedb.org/t/p/w1920_and_h800_multi_faces/${movie.backdrop_path})`
            : undefined,
        }}
      >
        <div className="bg-theme-movie">
          <div className="mx-auto max-w-7xl items-center px-4 py-8 sm:flex sm:px-6 lg:px-8">
            <div className="flex-none self-start sm:w-[300px]">
              <div className="aspect-2/3 overflow-hidden rounded-lg">
                {movie.poster_path ? (
                  <img
                    src={`https://www.themoviedb.org/t/p/w300_and_h450_bestv2${movie.poster_path}`}
                    srcSet={`https://www.themoviedb.org/t/p/w300_and_h450_bestv2${movie.poster_path} 1x, https://www.themoviedb.org/t/p/w600_and_h900_bestv2${movie.poster_path} 2x`}
                    alt={movie.title}
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-gray-100" />
                )}
              </div>
            </div>

            <div className="mt-6 sm:mt-0 sm:ml-10">
              <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl">
                {movie.title}{' '}
                <span className="font-extralight text-gray-200">
                  ({formatYear(movie.release_date)})
                </span>
              </h2>

              <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                <div className="mt-2 flex items-center text-sm font-light text-gray-200">
                  <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-300" />
                  {formatShortDate(movie.release_date)}
                </div>

                <div className="mt-2 flex items-center text-sm font-light text-gray-200">
                  <FilmIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-300" />

                  {movie.genres?.map((genre) => genre.name).join(', ')}
                </div>

                {movie.runtime ? (
                  <div className="mt-2 flex items-center text-sm font-light text-gray-200">
                    <ClockIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-300" />
                    {formatRuntime(movie.runtime)}
                  </div>
                ) : null}
              </div>

              <div className="mt-6 flex items-center space-x-6">
                {movie.vote_average ? <Rating rating={movie.vote_average} /> : null}

                <button
                  type="button"
                  className="ml-6 inline-flex items-center rounded-md border border-transparent bg-blue-100 py-2 pl-4 pr-5 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-700"
                  onClick={() =>
                    listModalDispatch({
                      type: 'SHOW_ADD_MODAL',
                      item: formatMovie(movie),
                    })
                  }
                >
                  <PlusSmIcon className="mr-2 -ml-1 h-5 w-5" />
                  Add to list
                </button>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-bold italic text-gray-200">{movie.tagline}</h3>
              </div>

              <div className="mt-1">
                <p className="font-light leading-7 text-gray-200">{movie.overview}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 pb-5">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Top billed cast</h3>
        </div>

        {credits.cast ? (
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-8">
            {credits.cast?.slice(0, 8).map((result) => (
              <li key={result.id} className="relative">
                <ListItem
                  item={{
                    tmdbId: result.id ?? 0,
                    type: 'person',
                    title: result.name ?? 'Unknown name',
                    subTitle: result.character,
                    poster: result.profile_path ?? undefined,
                  }}
                  showType={false}
                  action="add"
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );
}
