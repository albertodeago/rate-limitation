import Deferred from "./Deferred";

/**
 * Class to limit the amount of parallel function execution to a certain limit value.
 *
 * @example
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

        /**
         * The amount of possible "concurrent" function executions.
         * @type {number}
         */
        this.limit = limit;

        /**
         * Callback to execute after a function execution if the are no other to execute
         */
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
     * @private
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
     * @private
     * Process a request by taking one from the waitingQueue and putting into processingQueue.
     * When the request is done, remove it from the processingQueue.
     */
    _processRequest() {
        const reqToProcess = this.waitingQueue.shift();
        let maybePromise;
        this.processingQueue.push(reqToProcess);

        try {
            maybePromise = reqToProcess.func()
        } catch (error) {
            reqToProcess.def.reject(error);
            this._dequeueRequest(reqToProcess);
        }

        if (maybePromise && typeof maybePromise.then === "function") {
            // the function returned a promise as expected, wait for resolution
            maybePromise.then(result => {
                    reqToProcess.def.resolve(result);
                    this._dequeueRequest(reqToProcess);
                })
                .catch(error => {
                    reqToProcess.def.reject(error);
                    this._dequeueRequest(reqToProcess);
                });
        } else {
            // the function didn't return a promise. Just resolve
            reqToProcess.def.resolve(maybePromise);
            this._dequeueRequest(reqToProcess);
        }
    }

    /**
     * @private
     * Remove a request from the processingQueue (and thus call the onDequeue method after)
     * @param {*} request 
     */
    _dequeueRequest(request) {
        const index = this.processingQueue.findIndex(req => req === request);
        this.processingQueue.splice(index, 1);
        this._onDequeue();
    }
}