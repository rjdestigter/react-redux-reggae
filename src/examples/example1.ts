import { createStore, Store, Action } from "redux";
import * as React from "react";
import ReactDOMServer from "react-dom/server";

import ReggaeReducer from "../ReggaeReducer";
import combineReggaeReducers from "../combineReggaeReducers";

import reggaifyStore from "../reggaeifyStore";
import connect from "../connect";

interface State {
  data: number[];
  label: string;
}

interface AddAction extends Action<"ADD"> {
  payload: number;
}

type RemoveAction = Action<"REMOVE">;

export const add = (): AddAction => ({ type: "ADD", payload: Math.random() });
export const remove = (): RemoveAction => ({ type: "REMOVE" });

const initialState: State = {
  data: [],
  label: "Example 1"
};

const initialState2: State = {
  data: [],
  label: "Example 2"
};

const reducer = (
  state: State | undefined = initialState,
  action: AddAction | RemoveAction
): State => {
  if (action.type === "ADD") {
    return {
      ...state,
      data: [...state.data, action.payload]
    };
  }

  const [head, ...tail] = state.data;

  return {
    ...state,
    data: tail
  };
};

export const reggae = ReggaeReducer.create(initialState, reducer);
export const reggae2 = ReggaeReducer.create(initialState2, reducer);

export const combinedReggae = combineReggaeReducers({
  foo: reggae,
  bar: reggae2
});

let subscribers: Array<() => void> = [];

export const store: Store<
  ReturnType<typeof combinedReggae.reducer>[0]
> = createStore(() => void 0 as any);

reggaifyStore(store, combinedReggae);

reggae.subscribe(() => console.info("You ran REGGAE 1!"));
// reggae2.subscribe(() => console.info("You ran REGGAE 2!"));
combinedReggae.subscribe(() => console.info("You ran COMBINED REGGAE!"));

class Foo extends React.PureComponent {
  public render() {
    console.log("I rendered!");
    return "Hello World";
  }
}

export const Bar = connect(reggae)(Foo);

ReactDOMServer.renderToString(React.createElement(Bar));