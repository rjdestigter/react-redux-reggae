import { Action, AnyAction, Reducer } from 'redux'

import actionTypes from './actionTypes'

/**
 * Options passed to ReggaeReducer.creaete or the ReggaeReducer class constructor.
 *
 * disabled: Whether the reducer should start in disabled mode or not (_usageCount = 0)
 *
 * getAdditionalSubscriptions:
 * Currently used as a workaround-hack to support a wrapper around Redux's "combineReducer"
 *
 */
export interface Options {
  disabled?: boolean
  getAdditionalSubscriptions?: () => Array<() => void>
}

/**
 * Class that wraps around simple reducer functions, (S, A) => S, turning them into
 * "pausible" and "subscribable" reducers.
 */
export default class ReggaeReducer<S, A extends Action = AnyAction> {
  /**
   * Static function for creating a "Reggae" reducer.
   *
   * @param {Reducer<S, A>} reducer - Reducer function
   * @param {Options} maybeOptions  - Options for the "reggae" reducer
   */
  public static create<S = any, A extends Action = AnyAction>(
    reducer: Reducer<S, A>,
    maybeOptions?: Options,
  ) {
    const reggaeReducer = new ReggaeReducer(reducer, maybeOptions)
    return reggaeReducer
  }

  // The reducer that is wrapped
  private _reducer: Reducer<S, A>

  // List of subscriptions to the reducer
  private _subscriptions: Array<() => void> = []

  // Hack used to combine subscriptions of sub-reducers of a wrapped "combineReducer" reducer
  private _getAdditionalSubscriptions?: () => Array<() => void>

  // Initial usage count. Tracks whether the reducer is "paused" or not. Should never be lower than 0
  private _usageCount = 1

  // Initial state of the reducer
  private _initialState: S

  constructor(reducer: Reducer<S, A>, maybeOptions?: Options) {
    const options = maybeOptions || {}
    this._initialState = reducer(undefined, actionTypes.INIT as any)
    this._reducer = reducer
    this._usageCount = !!options.disabled ? 0 : 1
    this._getAdditionalSubscriptions = options.getAdditionalSubscriptions
  }

  /**
   * The "regaeified" reducer function
   *
   * @param {S | undefined} state - Current state
   * @param {A} - Dispatched action
   * @returns {S, [() => void]} - A tuple of next state and list of subscriptions
   */
  public reducer = (
    state: S | undefined,
    action: A,
  ): [S, Array<() => void>] => {
    // Check if the reducer is "paused" or not
    if (!this.isDisabled()) {
      // Compute the next state using the given wrapped reducer
      const nextState = this._reducer(state, action)

      // Return state and subscriptions if state has changed
      if (nextState !== state) {
        // Hack!
        // When combineReggaeReducer uses .create it passes a callback function that will return
        // all subscriptions of it's sub-reducers. This allows concatenating the list of subscriptions of the
        // "combined" reggaeified reducer with the list of subscriptions of it's sub-reducers.
        if (this._getAdditionalSubscriptions) {
          const additionalSubscriptions = this._getAdditionalSubscriptions()

          // Return nextState and concatenated list of subscriptions
          return [
            nextState,
            this._subscriptions.concat(additionalSubscriptions),
          ]
        }

        // Return nextState and subscriptions
        return [nextState, this._subscriptions]
      }

      // Return unchanged state and an empty list of subscriptions.
      return [state, []]
    }

    return [state || this._initialState, []]
  }

  /**
   * Returns true if the reducer is "paused"
   */
  public isDisabled() {
    return this._usageCount <= 0
  }

  /**
   * Un-pauses the reducer
   */
  public enable() {
    this._usageCount += 1
  }

  /**
   * Pauses the reducer by decreasing it's usage count. The reducer is only
   * really paused if it's usage count is less than or equal to zero.
   */
  public disable() {
    this._usageCount -= 1
  }

  /**
   * Replaces the wrapped reducer for this class
   * @param reducer
   */
  public replace(reducer: Reducer<S, A>) {
    this._initialState = reducer(undefined, actionTypes.REPLACE as any)
    this._reducer = reducer
  }

  /**
   * Subscribe to the reducer to "listen" for changes to the state belonging to the reducer.
   * @param {() => void} listener - Callback function
   * @return {() = void} - Unsubscribe function
   */
  public subscribe(listener: () => void) {
    // Add the listener to the list of subscriptions.
    const subscriptions = this._subscriptions
    subscriptions.push(listener)

    // Return an "unsubscribe" function.
    return () => {
      const index = subscriptions.indexOf(listener)
      subscriptions.splice(index, 1)
    }
  }
}
