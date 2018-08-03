import * as React from "react";
import ReggaeReducer from "./ReggaeReducer";
import { Store } from "redux";

import { any } from "prop-types";

export default (...reducers: ReggaeReducer<any, any>[]) => <P = {}>(
  Component: React.ComponentType<P>
) => {
  class ReggaeComponent extends React.PureComponent<P> {
    private _store: Store<any>;

    constructor(props: P, context: { store: Store<any> }) {
      super(props, context);
      this._store = {
        ...context.store,
        subscribe: (cb: () => void) => {
          const unsubscribers = reducers.map(reducer => reducer.subscribe(cb));

          return () => {
            unsubscribers.forEach(unsubscribe => unsubscribe());
          };
        }
      };
    }

    public static contextTypes: {
      store: any;
    };

    public render() {
      return React.createElement(
        Component,
        Object.assign({}, this.props, { store: this._store })
      );
    }
  }
};
