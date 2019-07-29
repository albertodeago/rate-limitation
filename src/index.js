/**
 * @description
 * Deferred like API for native promise.
 */
class Deferred {

    constructor(resolveWith = undefined) {

        /**
         * @description
         * The native promise
         */
        this.promise;

        /**
         * @description
         * Resolve the promise
         */
        this.resolve;

        /**
         * @description
         * Resolve the promise
         */
        this.reject;

        this.promise = new Promise((resolveRef, rejectRef) => {
            // Evaluate references
            this.resolve = resolveRef;
            this.reject = rejectRef;
        });

        if (typeof resolveWith !== "undefined") {
            this.resolve(resolveWith);
        }
    }

}

/** TODO:
 * Class to limit the amount of parallel function to a certain limit value.
 *
 * Example of use:
 * const rateLimiter = new RateLimiter(2); // max 2 "concurrent" function
 * // create an async function that adds numbers (make sense)
 * const asyncAdd = () => new Promise((resolve) => setTimeout(() => resolve([...arguments].reduce((a,b) => a + b, 0)), 2500)); // sum of all arguments after 2.5 seconds
 * for(let i = 0; i < 50; ++i) {
 *     rateLimiter.enqueue(asyncAdd, this, i, i+1, i+2);
 * }
 */
export default class RateLimiter {

    constructor(limit, options = {}) {

        /**
         * Amount of possible parallel requests
         * @type {number}
         */
        this.limit;

        /**
         * Queue that will contain the requests in "pending".
         * @type {Array}
         */
        this.waitingQueue = [];

        /**
         * Queue that will contain the request in "process".
         * @type {Array}
         */
        this.processingQueue = [];

        /**
         * Callback to fire when the queue becomes empty after a done request.
         * @type {Function}
         */
        this.onQueueEmpty;

        this.limit = limit;
        this.onQueueEmpty = options.onQueueEmpty;
    }

    /**
     * Add a request to the queue. If there is space available to be ran in parallel it will be immediately processed.
     * The request will wait for an empty slot otherwise.
     * @param {Function} funct - the function to execute
     * @param {Object} context - the "this" to bind the function
     * @param {*} params - the parameters to invoke the function with
     * @returns {Promise<*>}
     */
    enqueue(funct, context, ...params) {
        const req = {
            def: new Deferred(),
            func: funct.bind(context, ...params)
        };
        this.waitingQueue.push(req); // add to waiting requests

        if (this.processingQueue.length < this.limit) {
            // if there is an "empty slot", process a requests
            this._processRequest();
        } else {
            // Do nothing
        }

        return req.def.promise;
    }

    /**
     * Callback to fire when a request is done. If there are other requests in waiting, process one.
     */
    _onDequeue() {
        if (this.waitingQueue.length) {
            this._processRequest();
        } else {
            // the queue is empty, call callback if defined
            if (this.onQueueEmpty) {
                this.onQueueEmpty();
            }
        }
    }

    /**
     * Process a request by taking one from the waitingQueue and putting into processingQueue.
     * When the request is done, remove it from the processingQueue.
     */
    _processRequest() {
        const reqToProcess = this.waitingQueue.shift();
        this.processingQueue.push(reqToProcess);
        reqToProcess.func()
            .then(result => {
                reqToProcess.def.resolve(result);
                const index = this.processingQueue.findIndex(req => req === reqToProcess);
                this.processingQueue.splice(index, 1);
                this._onDequeue();
            })
            .catch(error => {
                reqToProcess.def.reject(error);
                const index = this.processingQueue.findIndex(req => req === reqToProcess);
                this.processingQueue.splice(index, 1);
                this._onDequeue();
            });
    }
}