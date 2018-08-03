// Types from Redux
import { Action, AnyAction, Store } from 'redux'

// ReggaeReducer
import ReggaeReducer from './ReggaeReducer'

/**
 * Adds support to the Redux store for handling reggae reducers.
 * Creates the final reducer function that returns state vs. a tuple of
 * state and subscriptions.  (S, A) => S vs. ([S, Array<() => void>]) => S
 *
 * Also subscribes to the store and subsequently informs all reducer subscriptions
 * @param store
 * @param reggaeReducer
 */
export default function reggaeifyStore<S, A extends AnyAction = Action>(
  store: Store<S>,
  reggaeReducer: ReggaeReducer<S, A>,
) {
  // Mutuable list of reducer subscriptions
  let finalSubscriptions: Array<() => void> = []

  // Compute initial state
  const [initialState] = reggaeReducer.reducer(undefined, {
    type: `${Math.random()}`,
  } as any)

  /**
   * Final store reducer
   * @param {S | undefined} state - Redux store state
   * @param {A} action - Action dispatched
   * @returns {S} - Next store state
   */
  function storeReducer(state: S | undefined, action: A) {
    // Get the next state and list of subscriptions from the reggae reducer
    const [nextState, subscriptions] = reggaeReducer.reducer(state, action)

    // Create a unique list of subscriptions
    finalSubscriptions = Array.from(new Set(subscriptions))

    // Return next state to the store
    return nextState || initialState
  }

  // Replace the store's current reducer with the "reggaeified" reducer
  store.replaceReducer(storeReducer as any)

  // Subscribe to the store
  store.subscribe(() => {
    // Empty out the list of reducer subscriptions and execute each listed callback
    while (finalSubscriptions.length) {
      const subscriber = finalSubscriptions.pop()

      if (subscriber) {
        subscriber()
      }
    }
  })
}
