const RateLimiter = require("./dist/rate-limitation.cjs");

const asyncAdd = function(...args) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(args.reduce((a, b) => a + b, 0)), 2000);
    })
}

asyncAdd(1, 2).then(console.log);
asyncAdd(1, 2).then(console.log);
asyncAdd(1, 2).then(console.log);

const rateLimiter = new RateLimiter(1);

rateLimiter.enqueue(asyncAdd, this, 1, 2, 3, 4, 5).then(console.log);
rateLimiter.enqueue(asyncAdd, this, 1, 2, 3, 4, 5).then(console.log);
rateLimiter.enqueue(asyncAdd, this, 1, 2, 3, 4, 5).then(console.log);