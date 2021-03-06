import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'
import typescript from 'rollup-plugin-typescript2'

const env = process.env.NODE_ENV

const config = {
  input: 'src/index.ts',
  external: ['react', 'redux', 'react-redux', 'lodash'],
  output: {
    format: 'umd',
    name: 'ReactRedux',
    globals: {
      react: 'React',
      redux: 'Redux'
    }
  },
  plugins: [
    typescript(/*{ plugin options }*/),
    nodeResolve(),
    babel({
      exclude: '**/node_modules/**'
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    }),
    commonjs()
  ]
}

if (env === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  )
}

export default config
