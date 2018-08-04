# react-redux-reggae

Subscribe to reducers instead of the store!

## Why?

Right now, I'm just having some fun. I asked myself the question: "What if I could subscribe to reducers instead to minimize the number of subscriptions executed after an action has been dispatched"

### "reggae"?

I dunno, I just needed a label that started with "re" :D

## How

Just your regular redux imports

```typescript
import { Action, createStore, Store } from 'redux'
import { connect, Provider } from 'react-redux'
```

Then some local ones

```typescript
// Wrapper around Redux.combineReducers
import combineReggaeReducers from '../src/combineReggaeReducers'
// Wrapper around regular reducer functions (S, A) => S
import ReggaeReducer from '../src/ReggaeReducer'
// Wrapper around react-redux's connect
import connectReggae from '../src/connect'
// Store mutater, calls store.replaceReducers and subscribes to it
import reggaifyStore from '../src/reggaeifyStore'
```

Some types:

```typescript
interface State {
  data: number[]
  label: string
}

interface AddAction extends Action<'ADD'> {
  payload: number
}

type RemoveAction = Action<'REMOVE'>
```

Some action creators:

```typescript
export const add = (): AddAction => ({ type: 'ADD', payload: Math.random() })
export const remove = (): RemoveAction => ({ type: 'REMOVE' })
```

Some data:

```typescript
const initialState: State = {
  data: [],
  label: 'Example 1'
}
```

Just an old fashioned reducer taking state and action and returning state

```typescript
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
```

Ok, let's wrap around that reducer. We'll create 2 and make use of our wrapper around `combineReducers` by Redux.

```typescript
export const reggae = ReggaeReducer.create(reducer)
export const reggae2 = ReggaeReducer.create(reducer)

export const combinedReggae = combineReggaeReducers({
  foo: reggae,
  bar: reggae2
})
```

Just an old fashioned Redux store. I'm passing in a non-reducer for now

```typescript
export const store: Store<
  ReturnType<typeof combinedReggae.reducer>[0]
> = createStore(() => void 0 as any)
```

Now mutate the store with our reggaeified reducer

```typescript
reggaifyStore(store, combinedReggae)
```

And this is how you subscribe:

```typescript
// Subscribe to the reducers
reggae.subscribe(() => console.info('You ran REGGAE 1!'))
combinedReggae.subscribe(() => console.info('You ran COMBINED REGGAE!'))

// Component
class ListOfNumbers extends React.PureComponent<State> {
  public render() {
    console.log('Foo rendered!')
    return this.props.data.join(', ')
  }
}

// Container
const mapStateToProps = <S extends { foo: State }>(state: S) => state.foo

const ListOfNumbersContainer = connect(mapStateToProps)(ListOfNumbers)

// "connectReggae" does nothing else then pass down a different context.store.subscribe function
const ListOfNumbersSubscribedToReducer = connectReggae(reggae)(
  ListOfNumbersContainer
)
```
