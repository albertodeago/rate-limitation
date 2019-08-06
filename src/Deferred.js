/**
 * @description
 * Deferred like API for native promise.
 */
export default class Deferred {

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
         * Reject the promise
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