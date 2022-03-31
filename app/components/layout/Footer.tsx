import { Form, Link } from 'remix';

import LinkedInIcon from '../assets/icons/LinkedIn';
import TwitterIcon from '../assets/icons/Twitter';
import GitHubIcon from '../assets/icons/GitHub';

import { useUserState } from '~/hooks/useUser';

const Footer = () => {
  // Hooks
  const userState = useUserState();

  // Render
  return (
    <footer className="bg-white">
      <div className="mx-auto mt-8 max-w-7xl overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          {userState.auth ? (
            <>
              <div className="px-5 py-2">
                <Link to="/lists" className="text-base text-gray-500 hover:text-gray-900">
                  My lists
                </Link>
              </div>
              <div className="px-5 py-2">
                <Link to="/my-account" className="text-base text-gray-500 hover:text-gray-900">
                  My account
                </Link>
              </div>

              <Form action="/sign-out" method="post" reloadDocument className="px-5 py-2">
                <button type="submit" className="text-base text-gray-500 hover:text-gray-900">
                  Sign out
                </button>
              </Form>
            </>
          ) : (
            <>
              <div className="px-5 py-2">
                <Link to="/sign-in" className="text-base text-gray-500 hover:text-gray-900">
                  Sign in
                </Link>
              </div>
              <div className="px-5 py-2">
                <Link to="/register" className="text-base text-gray-500 hover:text-gray-900">
                  Create account
                </Link>
              </div>
            </>
          )}
        </nav>
        <div className="mt-8 flex justify-center space-x-6">
          <a
            href="https://uk.linkedin.com/in/chapmanio"
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">LinkedIn</span>
            <LinkedInIcon className="h-6 w-6" />
          </a>

          <a href="https://twitter.com/chapmanio" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Twitter</span>
            <TwitterIcon className="h-6 w-6" />
          </a>

          <a
            href="https://github.com/chapmanio/movies-remix"
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">GitHub</span>
            <GitHubIcon className="h-6 w-6" />
          </a>
        </div>
        <p className="mt-8 text-center text-base text-gray-400">
          &copy; {new Date().getFullYear()}{' '}
          <a href="https://chapmanio.dev" className="hover:underline">
            chapmanio.dev
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
