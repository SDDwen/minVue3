import typescript from '@rollup/plugin-typescript'
export default {
  input: './src/index.ts',
  output: [
    // cjs -> commonJS
    // esm
    {
      format: 'cjs',
      file: 'lib/guide-min-vue.cjs.js'
    },
    {
      format: 'es',
      file: 'lib/guide-min-vue.esm.js'
    }
  ],
  plugins: [typescript()]
}