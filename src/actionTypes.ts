/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
export default {
  INIT:
    '@@react-redux-reggae/INIT' +
    Math.random()
      .toString(36)
      .substring(7)
      .split('')
      .join('.'),
  REPLACE:
    '@@react-redux-reggae/REPLACE' +
    Math.random()
      .toString(36)
      .substring(7)
      .split('')
      .join('.'),
}
