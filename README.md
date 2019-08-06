# rate-limitation
A **small** rate limiter library. Useful for example to prevent too many requests concurrently.  
Compatible with both browser and nodejs enviroments.  
**Only 2kb** minified not gzipped  
<a href="https://albertodeago.github.io/rate-limitation/" target="_blank">Demo</a>

## Usage
To use the library install from npm:

``` bash
npm install --save rate-limitation
```

After the package is installed import in your project and use it

In node like this:
``` js
const RateLimiter = require("rate-limitation");
```
In a web project:
``` js
import RateLimiter from "rate-limitation";
```

When you have imported you can use it like this:
``` js
const asyncAdd = (...args) => {
    // a very long and useful async task
    return new Promise(resolve => {
        setTimeout(() => {
            const result = args.reduce((a, b) => a + b, 0);
            console.log(result);
            resolve(result);
        }, 5000);
    });
};

const rateLimiter = new RateLimiter(2);
rateLimiter.enqueue(asyncAdd, this, 1,2,3,4,5);
rateLimiter.enqueue(asyncAdd, this, 1,2,3,4,5);
rateLimiter.enqueue(asyncAdd, this, 1,2,3,4,5); // this will be executed after 5000ms
rateLimiter.enqueue(asyncAdd, this, 1,2,3,4,5); // this will be executed after 5000ms
```

## API

The RateLimiter instance has just one method:
 - enqueue - it accept 3 parameters:
   - func {Function} the function to execute
   - context {Any} the this to invoke the function with
   - parameters {Any} the parameters to invoke the function with. Can be an unlimited amount

## Development
Fork the project, install the dependencies with
```
npm install
```
and then try it out. To Build run
To run the tests:
```
npm run build
```
You can build just the bundle for node or for the web with
``` js
npm run build-cjs // for node
npm run build-esm // for web projects
```

## Test
To run the tests:
```
npm run test
```
The tests are on the bundled project. You can build and run test automatically with
```
npm run build-test
```

## Browser support
Using Promises the library supports only modern browsers excluding IE11.  
But you can easily make it work in IE11 by installing a Promise polyfills like <a href="https://github.com/taylorhakes/promise-polyfill" target="_blank">this one</a>
