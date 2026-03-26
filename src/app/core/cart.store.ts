import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
  withHooks,
} from '@ngrx/signals';
import { HttpClient } from '@angular/common/http';
import { TICKETS_URL } from './tokens';
import {
  withRequestStatus,
  setPending,
  setFulfilled,
  setError,
} from './store-features/request-status.feature';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, tap, switchMap, exhaustMap } from 'rxjs';

type CartState = {
  ticketIds: string[];
};

interface TicketEntry {
  id: string;
  eventId: string;
}

export const CartStore = signalStore(
  { providedIn: 'root' },

  withState<CartState>({ ticketIds: [] }),

  withRequestStatus(),

  withComputed(({ ticketIds }) => ({
    count: () => ticketIds().length,
  })),

  withMethods((store) => {
    const http = inject(HttpClient);
    const ticketsUrl = inject(TICKETS_URL);

    return {
      load: rxMethod<void>(
        pipe(
          tap(() => patchState(store, setPending())),
          switchMap(() =>
            http.get<TicketEntry[]>(ticketsUrl).pipe(
              tapResponse({
                next: (tickets) =>
                  patchState(store, { ticketIds: tickets.map((t) => t.eventId) }, setFulfilled()),
                error: (err: any) => patchState(store, setError(err.message)),
              }),
            ),
          ),
        ),
      ),

      addToCart: rxMethod<{ eventId: string }>(
        pipe(
          exhaustMap(({ eventId }) => {
            patchState(
              store,
              (state) => ({ ticketIds: [...state.ticketIds, eventId] }),
              setPending(),
            );
            return http.post(ticketsUrl, { eventId }).pipe(
              tapResponse({
                next: () => {
                  patchState(store, setFulfilled());
                  console.log('Transaction Confirmed');
                },
                error: (err: any) => {
                  console.error('Transaction Failed - Rolling Back');

                  patchState(
                    store,
                    (state) => {
                      const index = state.ticketIds.lastIndexOf(eventId);
                      if (index === -1) return state;

                      const newIds = [...state.ticketIds];
                      newIds.splice(index, 1);
                      return { ticketIds: newIds };
                    },
                    setError(err.message),
                  );
                },
              }),
            );
          }),
        ),
      ),
    };
  }),

  withHooks({
    onInit(store) {
      store.load();
    },
  }),
);
