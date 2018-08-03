import { Action, AnyAction, Reducer } from "redux";

export interface Options {
  disabled?: boolean;
  getAdditionalSubscriptions?: () => Array<() => void>;
}

export default class ReggaeReducer<S, A extends Action = AnyAction> {
  public static create<S = any, A extends Action = AnyAction>(
    initialState: S,
    reducer: Reducer<S, A>,
    maybeOptions?: Options
  ) {
    const reggaeReducer = new ReggaeReducer(
      initialState,
      reducer,
      maybeOptions
    );

    return reggaeReducer;
  }

  private _reducer: Reducer<S, A>;
  private _subscriptions: Array<() => void> = [];
  private _getAdditionalSubscriptions?: () => Array<() => void>;
  private _usageCount = 0;
  private _initialState: S;

  constructor(initialState: S, reducer: Reducer<S, A>, maybeOptions?: Options) {
    const options = maybeOptions || {};
    this._initialState = initialState;
    this._reducer = reducer;
    this._usageCount = !!options.disabled ? 0 : 1;
    this._getAdditionalSubscriptions = options.getAdditionalSubscriptions;
  }

  public reducer = (
    state: S | undefined,
    action: A
  ): [S, Array<() => void>] => {
    if (!this.isDisabled()) {
      const nextState = this._reducer(state, action);

      if (nextState !== state) {
        if (this._getAdditionalSubscriptions) {
          const additionalSubscriptions = this._getAdditionalSubscriptions();
          return [
            nextState,
            this._subscriptions.concat(additionalSubscriptions)
          ];
        }

        return [nextState, this._subscriptions];
      }

      return [state, []];
    }

    return [state || this._initialState, []];
  };

  public isDisabled() {
    return this._usageCount <= 0;
  }

  public enable() {
    this._usageCount += 1;
  }

  public disabled() {
    this._usageCount -= 1;
  }

  public replace(reducer: Reducer<S, A>) {
    this._reducer = reducer;
  }

  public subscribe(listener: () => void) {
    const subscriptions = this._subscriptions;
    subscriptions.push(listener);

    return function() {
      const index = subscriptions.indexOf(listener);
      subscriptions.splice(index, 1);
    };
  }
}
