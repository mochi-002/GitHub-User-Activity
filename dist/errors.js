class GitHubApiError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = "GitHubApiError";
    }
}
export { GitHubApiError };
