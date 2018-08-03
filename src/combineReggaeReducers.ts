import {
  combineReducers,
  ReducersMapObject,
  Reducer,
  Action,
  AnyAction
} from "redux";

import ReggaeReducer from "./ReggaeReducer";

export type ReggaeReducersMapObject<S = any, A extends Action = Action> = {
  [K in keyof S]: ReggaeReducer<S[K], A>
};

export default function combineReggaeReducers<S, A extends Action = AnyAction>(
  reducers: ReggaeReducersMapObject<S, A>
): ReggaeReducer<S, A> {
  const stateKeys: (keyof typeof reducers)[] = Object.keys(reducers) as any;

  let subscriptions: Array<() => void> = [];

  const actualMap: ReducersMapObject<S> = stateKeys.reduce((acc, stateKey) => {
    const reggaeReducer = reducers[stateKey];
    const stateKeyReducer = (state: S[typeof stateKey], action: A) => {
      const [stateOfKey, subscriptionsOfKey] = reggaeReducer.reducer(
        state,
        action
      );
      subscriptions.push(...subscriptionsOfKey);
      return stateOfKey;
    };

    acc[stateKey] = stateKeyReducer;

    return acc;
  }, Object.create(null));

  const reducersCombined = combineReducers(actualMap);

  const reducer = (state: S | undefined, action: A) => {
    subscriptions = [];
    return reducersCombined(state, action);
  };

  return ReggaeReducer.create({} as S, reducer, {
    getAdditionalSubscriptions: () => subscriptions
  });
}
