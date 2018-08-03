import { Store, AnyAction, Action } from "redux";
import ReggaeReducer from "./ReggaeReducer";

export default function reggaeifyStore<S, A extends AnyAction = Action>(
  store: Store<S>,
  reggaeReducer: ReggaeReducer<S, A>
) {
  let finalSubscriptions: Array<() => void> = [];

  const [initialState] = reggaeReducer.reducer(undefined, {
    type: `${Math.random()}`
  } as any);

  function storeReducer(state: S | undefined, action: A) {
    const [nextState, subscriptions] = reggaeReducer.reducer(state, action);
    finalSubscriptions = Array.from(new Set(subscriptions));
    return nextState || initialState;
  }

  store.replaceReducer(storeReducer as any);

  store.subscribe(() => {
    while (finalSubscriptions.length) {
      const subscriber = finalSubscriptions.pop();

      if (subscriber) {
        subscriber();
      }
    }
  });
}
