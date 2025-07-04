import resolve from '@rollup/plugin-node-resolve';
import eslint from '@rollup/plugin-eslint'; 

export default [
  {
    input: 'integration-test/test.js',
    output: {
      format: 'es',
      file: 'integration-test/test_roll.js',
    },
    plugins: [
      resolve(), // so Rollup can find external modules
      eslint({ 
        exclude: ['./node_modules/**', './src/style/**'], 
        fix: true,
      }),
    ],
  },
];
