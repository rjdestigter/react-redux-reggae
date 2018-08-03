import * as React from 'react'
import { Store } from 'redux'
import ReggaeReducer from './ReggaeReducer'

import { any } from 'prop-types'

export default (...reducers: Array<ReggaeReducer<any, any>>) => <P = {}>(
  Component: React.ComponentType<P>, // tslint:disable-line:variable-name
) => {
  class ReggaeComponent extends React.PureComponent<P> {
    public static contextTypes: {
      store: any,
    }
    private _store: Store<any>

    constructor(props: P, context: { store: Store<any> }) {
      super(props, context)
      this._store = {
        ...context.store,
        subscribe: (cb: () => void) => {
          const unsubscribers = reducers.map((reducer) => reducer.subscribe(cb))

          return () => {
            unsubscribers.forEach((unsubscribe) => unsubscribe())
          }
        },
      }
    }

    public render() {
      return React.createElement(
        Component,
        Object.assign({}, this.props, { store: this._store }),
      )
    }
  }
}
