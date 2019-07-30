const RateLimiter = require("../dist/rate-limitation.cjs");

describe('RateLimiter', () => {

    test("it execute function enqueued", async() => {
        const rateLimiter = new RateLimiter(1);

        const asyncAdd = function(...args) {
            return new Promise((resolve) => {
                setTimeout(() => resolve(args.reduce((a, b) => a + b, 0)), 250);
            });
        };
        const res = await rateLimiter.enqueue(asyncAdd, this, 1, 2, 3);
        expect(res).toBe(6);
    });

    test("it execute 2 function at time if limit is 2", async() => {
        const rateLimiter = new RateLimiter(2);

        const mockFun = jest.fn((...args) => {
            return new Promise((resolve) => {
                setTimeout(() => resolve(args.reduce((a, b) => a + b, 0)), 250);
            });
        });

        rateLimiter.enqueue(mockFun, this, 0, 1);
        rateLimiter.enqueue(mockFun, this, 1, 2);
        rateLimiter.enqueue(mockFun, this, 2, 3);
        rateLimiter.enqueue(mockFun, this, 3, 4);
        rateLimiter.enqueue(mockFun, this, 4, 5);
        rateLimiter.enqueue(mockFun, this, 5, 6);

        expect.assertions(3);

        return new Promise((resolve) => {
            setTimeout(() => {
                expect(mockFun.mock.calls.length).toBe(2)
                expect(mockFun.mock.calls[0]).toEqual([0, 1])
                expect(mockFun.mock.calls[1]).toEqual([1, 2])
                resolve()
            }, 50);
        });
    });
});