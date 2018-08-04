import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import { Action, createStore, Store } from 'redux'

import combineReggaeReducers from '../src/combineReggaeReducers'
import ReggaeReducer from '../src/ReggaeReducer'

import connect from '../src/connect'
import reggaifyStore from '../src/reggaeifyStore'

interface State {
  data: number[]
  label: string
}

interface AddAction extends Action<'ADD'> {
  payload: number
}

type RemoveAction = Action<'REMOVE'>

export const add = (): AddAction => ({ type: 'ADD', payload: Math.random() })
export const remove = (): RemoveAction => ({ type: 'REMOVE' })

const initialState: State = {
  data: [],
  label: 'Example 1'
}

const State = {
  data: [],
  label: 'Example 2'
}

const reducer = (
  state: State | undefined = initialState,
  action: AddAction | RemoveAction
): State => {
  if (action.type === 'ADD') {
    return {
      ...state,
      data: [...state.data, action.payload]
    }
  }

  const [head, ...tail] = state.data

  return {
    ...state,
    data: tail
  }
}

export const reggae = ReggaeReducer.create(reducer)
export const reggae2 = ReggaeReducer.create(reducer)

export const combinedReggae = combineReggaeReducers({
  foo: reggae,
  bar: reggae2
})

const subscribers: Array<() => void> = []

export const store: Store<
  ReturnType<typeof combinedReggae.reducer>[0]
> = createStore(() => void 0 as any)

reggaifyStore(store, combinedReggae)

reggae.subscribe(() => console.info('You ran REGGAE 1!'))
// reggae2.subscribe(() => console.info("You ran REGGAE 2!"));
combinedReggae.subscribe(() => console.info('You ran COMBINED REGGAE!'))

class Foo extends React.PureComponent {
  public render() {
    console.log('I rendered!')
    return 'Hello World'
  }
}

export const Bar = connect(reggae)(Foo)

ReactDOMServer.renderToString(React.createElement(Bar))
