import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/rate-limitation.esm.js',
        format: 'esm'
    },
    plugins: [
        resolve(),
        babel({
            exclude: 'node_modules/**'
        }),
        terser()
    ]
};