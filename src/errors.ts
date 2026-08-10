class GitHubApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = "GitHubApiError"
  }
}

export {
  GitHubApiError
}
