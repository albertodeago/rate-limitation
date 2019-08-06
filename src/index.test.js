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

        const mockFun = jest.fn((...args) => new Promise((resolve) => {
            setTimeout(() => resolve(args.reduce((a, b) => a + b, 0)), 250);
        }));

        rateLimiter.enqueue(mockFun, this, 0, 1);
        rateLimiter.enqueue(mockFun, this, 1, 2);
        rateLimiter.enqueue(mockFun, this, 2, 3);
        rateLimiter.enqueue(mockFun, this, 3, 4);
        rateLimiter.enqueue(mockFun, this, 4, 5); // not useful, just to be sure the amount of calls will not count this 2 invocations
        rateLimiter.enqueue(mockFun, this, 5, 6); // not useful, just to be sure the amount of calls will not count this 2 invocations

        return new Promise((resolve) => {
            setTimeout(() => {
                expect(mockFun.mock.calls.length).toBe(2);
                expect(mockFun.mock.calls[0]).toEqual([0, 1]);
                expect(mockFun.mock.calls[1]).toEqual([1, 2]);

                setTimeout(() => {
                    expect(mockFun.mock.calls.length).toBe(4);
                    expect(mockFun.mock.calls[2]).toEqual([2, 3]);
                    expect(mockFun.mock.calls[3]).toEqual([3, 4]);

                    resolve();
                }, 250)
            }, 50);
        });
    });

    test("it correctly return the value of asynchronous functions", async() => {
        const rateLimiter = new RateLimiter(2);

        const mockFun = jest.fn((...args) => new Promise((resolve) => {
            setTimeout(() => resolve(args.reduce((a, b) => a + b, 0)), 250);
        }));

        rateLimiter.enqueue(mockFun, this, 0, 1, 2, 3, 4);
        rateLimiter.enqueue(mockFun, this, 40, 2);

        return new Promise((resolve) => {
            setTimeout(async() => {
                expect(mockFun.mock.calls.length).toBe(2);
                var result1 = await mockFun.mock.results[0].value;
                var result2 = await mockFun.mock.results[1].value;

                expect(result1).toBe(10)
                expect(result2).toBe(42)
                resolve();
            }, 50);
        });
    });

    test("it supports synchronous functions", () => {
        const rateLimiter = new RateLimiter(2);

        const mockFun = jest.fn((...args) => args.reduce((a, b) => a + b, 0));

        rateLimiter.enqueue(mockFun, this, 0, 1);
        rateLimiter.enqueue(mockFun, this, 1, 2);
        rateLimiter.enqueue(mockFun, this, 2, 3);

        expect(mockFun.mock.calls.length).toBe(3)
        expect(mockFun.mock.calls[0]).toEqual([0, 1]);
        expect(mockFun.mock.calls[1]).toEqual([1, 2]);
        expect(mockFun.mock.calls[2]).toEqual([2, 3]);
        expect(mockFun.mock.results[0].value).toBe(1);
        expect(mockFun.mock.results[1].value).toBe(3);
        expect(mockFun.mock.results[2].value).toBe(5);
    });

    test("it runs the callback when the queue become empty", () => {
        const mockOnQueueEmpty = jest.fn(() => {});
        const rateLimiter = new RateLimiter(1, {
            onQueueEmpty: mockOnQueueEmpty
        });

        const mockFun = jest.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));

        rateLimiter.enqueue(mockFun);
        rateLimiter.enqueue(mockFun);
        rateLimiter.enqueue(mockFun);
        rateLimiter.enqueue(mockFun);

        return new Promise((resolve) => {
            setTimeout(async() => {
                expect(mockFun.mock.calls.length).toBe(4);
                expect(mockOnQueueEmpty.mock.calls.length).toBe(1);
                resolve();
            }, 500);
        });
    });

});