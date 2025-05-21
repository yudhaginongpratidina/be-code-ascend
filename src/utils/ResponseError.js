// --------------------------------------------------------------------------------
// configure response error
// --------------------------------------------------------------------------------
export default class ResponseError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.message = message;
    }
}
