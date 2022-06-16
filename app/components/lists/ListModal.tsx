import { Link, useFetcher } from 'remix';
import { useEffect, useState } from 'react';

import Modal from '../assets/Modal';
import Alert from '../assets/Alert';
import Notification, { NotificationProps } from '../assets/Notification';

import { useUserState } from '../../hooks/useUser';
import { useListState, useListDispatch } from '../../hooks/useList';
import { useListModalDispatch, useListModalState } from '../../hooks/useListModal';

import { ActionData as ModalActionData } from '~/routes/lists/modal';

// Types
type NotificationType = Omit<NotificationProps, 'onClose'>;

// React
const ListModal = () => {
  // Hooks
  const lists = useFetcher<ModalActionData>();

  const userState = useUserState();
  const listState = useListState();
  const listDispatch = useListDispatch();
  const listModalState = useListModalState();
  const listModalDispatch = useListModalDispatch();

  // Local state
  const [error, setError] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<NotificationType | undefined>(undefined);

  // Effects
  useEffect(() => {
    if (listModalState.visible) {
      setNotification((notification) =>
        notification ? { ...notification, visible: false } : undefined
      );
    }
  }, [listModalState.visible]);

  useEffect(() => {
    // TODO: How do we make this only run after submit is pressed and no other times?
    // Do we have to programtically submit so we can change a ref to true/false

    if (lists.type === 'done') {
      if (lists.data.error) {
        setError(lists.data.error);
      } else {
        console.log('HERE!!');
        console.log(lists.data.action);

        switch (lists.data.action) {
          case 'addItem':
            if (lists.data.list && lists.data.listItem) {
              listDispatch({
                type: 'ADD_LIST_ITEM',
                slug: lists.data.list.slug,
                item: lists.data.listItem,
              });

              setNotification({
                type: 'success',
                title: 'Added to list',
                visible: true,
              });

              listModalDispatch({ type: 'HIDE_MODAL' });
            } else {
              setError('Something went wrong!');
            }

            break;
          case 'addList':
            if (lists.data.list && lists.data.listItem) {
              listDispatch({ type: 'ADD_LIST', list: lists.data.list });
              listDispatch({
                type: 'ADD_LIST_ITEM',
                slug: lists.data.list.slug,
                item: lists.data.listItem,
              });

              setNotification({
                type: 'success',
                title: 'Added to list',
                visible: true,
              });

              listModalDispatch({ type: 'HIDE_MODAL' });
            } else {
              setError('Something went wrong!');
            }

            break;
          case 'removeItem':
            if (lists.data.list && lists.data.listItem) {
              listDispatch({
                type: 'REMOVE_LIST_ITEM',
                slug: lists.data.list.slug,
                itemId: lists.data.listItem.id,
              });

              setNotification({
                type: 'success',
                title: 'Removed from list',
                visible: true,
              });

              listModalDispatch({ type: 'HIDE_MODAL' });
            } else {
              setError('Something went wrong!');
            }

            break;
          default:
            setError('Something went wrong!');

            break;
        }
      }
    }
  }, [listDispatch, listModalDispatch, lists]);

  // Render
  return (
    <>
      <Modal
        visible={listModalState.visible}
        title={listModalState.item?.title ?? 'Hidden modal'}
        canClose={true}
        onClose={() => listModalDispatch({ type: 'HIDE_MODAL' })}
      >
        {listModalState.item && listModalState.operation ? (
          <div className="flex flex-col items-center space-y-6 sm:flex-row sm:space-x-6 sm:space-y-0">
            <div className="w-36">
              <div className="block aspect-2/3 w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                {listModalState.item.poster && (
                  <img
                    src={`https://www.themoviedb.org/t/p/w220_and_h330_face${listModalState.item.poster}`}
                    alt=""
                    className="pointer-events-none object-cover"
                  />
                )}
              </div>
            </div>

            <div className="flex-1">
              <span
                className={
                  `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white` +
                  (listModalState.item.type === 'movie'
                    ? ` bg-blue-600`
                    : listModalState.item.type === 'tv'
                    ? ` bg-fuchsia-600`
                    : listModalState.item.type === 'person'
                    ? ` bg-green-600`
                    : ``)
                }
              >
                {listModalState.item.type === 'movie'
                  ? 'Movie'
                  : listModalState.item.type === 'tv'
                  ? 'TV Show'
                  : listModalState.item.type === 'person'
                  ? 'Person'
                  : ''}
              </span>

              <h2 className="mt-3 text-2xl font-bold leading-7 text-gray-900">
                {listModalState.item.title}
              </h2>
              <p className="pointer-events-none mt-1 block text-sm font-medium text-gray-500">
                {listModalState.item.subTitle}
              </p>

              {error ? (
                <div className="mt-6">
                  <Alert type="error" message={error} onClose={() => setError(undefined)} />
                </div>
              ) : null}

              {userState.auth ? (
                <lists.Form method="post" action="/lists/modal">
                  <input
                    type="hidden"
                    name="mediaType"
                    value={listModalState.item.type.toUpperCase()}
                  />
                  <input type="hidden" name="tmdbId" value={listModalState.item.tmdbId} />
                  <input type="hidden" name="title" value={listModalState.item.title} />
                  <input type="hidden" name="subtitle" value={listModalState.item.subTitle || ''} />
                  <input type="hidden" name="posterUrl" value={listModalState.item.poster || ''} />

                  {listModalState.operation === 'add' ? (
                    <div className="mt-6">
                      {listState.lists === undefined ? (
                        <div className="flex space-x-2">
                          <div className="h-9 w-2/3 animate-pulse rounded-md bg-gray-100" />
                          <div className="h-9 w-1/3 animate-pulse rounded-md bg-gray-100" />
                        </div>
                      ) : listState.lists && listState.lists.length > 0 ? (
                        <div className="flex space-x-2">
                          <select
                            id="list"
                            name="listSlug"
                            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            defaultValue={lists.data?.list?.slug ?? listModalState.list?.slug}
                          >
                            {listState.lists.map((list) => (
                              <option key={list.slug} value={list.id}>
                                {list.name}
                              </option>
                            ))}
                          </select>

                          <button
                            type="submit"
                            name="action"
                            value="addItem"
                            className={
                              `flex-none rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2` +
                              (lists.state === 'submitting'
                                ? ` opacity-75`
                                : ` hover:bg-indigo-700`)
                            }
                            disabled={lists.state === 'submitting'}
                          >
                            {lists.state === 'submitting' ? `Please wait...` : `Add to list`}
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <div className="w-full">
                            <label htmlFor="listName" className="sr-only">
                              List name
                            </label>
                            <input
                              type="text"
                              id="listName"
                              name="listName"
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                              placeholder="List name"
                              defaultValue={lists.data?.fields?.listName ?? ''}
                            />
                          </div>

                          <button
                            type="submit"
                            name="action"
                            value="addList"
                            className={
                              `flex-none rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2` +
                              (lists.state === 'submitting'
                                ? ` opacity-75`
                                : ` hover:bg-indigo-700`)
                            }
                            disabled={lists.state === 'submitting'}
                          >
                            {lists.state === 'submitting' ? `Please wait...` : `Create list`}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : listModalState.operation === 'remove' && listModalState.list ? (
                    <>
                      <input type="hidden" name="listId" value={listModalState.list.id} />
                      <input type="hidden" name="listItemId" value={listModalState.item.dbId} />

                      <p className="mt-5 text-gray-600">
                        Remove from <span className="font-bold">{listModalState.list.name}</span>?
                      </p>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          name="action"
                          value="removeItem"
                          className={
                            `inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm` +
                            (lists.state === 'submitting' ? ` opacity-75` : ` hover:bg-red-700`)
                          }
                          disabled={lists.state === 'submitting'}
                        >
                          {lists.state === 'submitting' ? `Please wait...` : `Remove`}
                        </button>
                        <button
                          type="button"
                          className={
                            `mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm` +
                            (lists.state === 'submitting' ? ` opacity-75` : ` hover:bg-gray-50`)
                          }
                          onClick={() => listModalDispatch({ type: 'HIDE_MODAL' })}
                          disabled={lists.state === 'submitting'}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : null}
                </lists.Form>
              ) : (
                <p className="mt-5 text-red-600">
                  You must be{' '}
                  <Link
                    to="/sign-in"
                    className="underline hover:text-red-700"
                    onClick={() => listModalDispatch({ type: 'HIDE_MODAL' })}
                  >
                    signed in
                  </Link>{' '}
                  to{' '}
                  {listModalState.operation === 'add'
                    ? `add to`
                    : listModalState.operation === 'remove'
                    ? `remove from`
                    : `update`}{' '}
                  a list.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {notification ? (
        <Notification
          {...notification}
          onClose={() =>
            setNotification((notification) =>
              notification ? { ...notification, visible: false } : undefined
            )
          }
        />
      ) : null}
    </>
  );
};

export default ListModal;
