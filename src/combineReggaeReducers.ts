// Types from Redux
import {
  Action,
  AnyAction,
  combineReducers,
  Reducer,
  ReducersMapObject,
} from 'redux'

// ReggaeReducer
import ReggaeReducer from './ReggaeReducer'

// Like Redux.ReducersMapObject but for ReggaeReducers
export type ReggaeReducersMapObject<S = any, A extends Action = Action> = {
  [K in keyof S]: ReggaeReducer<S[K], A>
}

/**
 * Wrapper around Redux.combineReducers for ReggaeReducers.
 * @param {ReggaeReducersMapObject<S, A>} reducers - Map of ReggaeReducers
 * @return {ReggaeReducer<S, A>} - Returns a "combined" reggae reducer
 */
export default function combineReggaeReducers<S, A extends Action = AnyAction>(
  reducers: ReggaeReducersMapObject<S, A>,
): ReggaeReducer<S, A> {
  // Determine keys on state of each reducer
  const stateKeys: Array<keyof typeof reducers> = Object.keys(reducers) as any

  // Mutuable list of reducer subscriptions
  let subscriptions: Array<() => void> = []

  // Turn ReggaeReducersMapObject into Redux.ReducersMapObject
  // This is NOT A PURE function. It's side effect is that it adds returned
  // subscriptions to the mutuable list of subscriptions declared above.
  const actualMap: ReducersMapObject<S> = stateKeys.reduce((acc, stateKey) => {
    // Take the reggae reducer
    const reggaeReducer = reducers[stateKey]

    // Create a normal (S, A) => S reducer for the mapped reggae reducer
    const stateKeyReducer = (state: S[typeof stateKey], action: A) => {
      const [stateOfKey, subscriptionsOfKey] = reggaeReducer.reducer(
        state,
        action,
      )

      // Do the horrible side-effect
      subscriptions.push(...subscriptionsOfKey)

      // Return state
      return stateOfKey
    }

    // Mutate the new map with the same key and point to "stateKeyReducer"
    acc[stateKey] = stateKeyReducer

    return acc
  }, Object.create(null))

  // Use Redux.combineReducers to create a combined reducer
  const reducersCombined = combineReducers(actualMap)

  // Create the reducer passed to ReggaeReducer.create
  // This is also NOT A PURE FUNCTION as it resets the mutuable list of subscriptions
  const reducer = (state: S | undefined, action: A) => {
    // Do the horrible side-effect
    subscriptions = []

    // Return the result of the combined reducer
    return reducersCombined(state, action)
  }

  // Reggaeify the combined reducer and return it
  return ReggaeReducer.create(reducer, {
    // ReggaeReducer.reducer will call "getAdditionalSubscriptions" to compile the final list
    // of reducer subscriptions.
    getAdditionalSubscriptions: () => subscriptions,
  })
}
