import { GitHubApiError } from "./errors.js";
import {} from "./types.js";
const GITHUB_API_BASE = "https://api.github.com";
/** Required by the GitHub API on every request, or it rejects the call. */
const USER_AGENT = 'Github-User-Activity';
/**
 * Fetches the most recent public events for a given GitHub username.
 *
 * @param username - The GitHub username to fetch events for.
 * @returns The raw parsed JSON response from GitHub (normally an array of
 * `GitHubEvent`, typed loosely here since error responses aren't arrays).
 * @throws {GitHubApiError} On 404 (bad username), 403 (rate limited), any
 * other non-OK response, or a network-level failure.
 */
async function fetchUserEvents(username) {
    try {
        const URL = `${GITHUB_API_BASE}/users/${username}/events`;
        const response = await fetch(URL, {
            headers: {
                "User-Agent": `${USER_AGENT}`
            }
        });
        if (response.status === 404) {
            throw new GitHubApiError(`User not found: ${username}`, 404);
        }
        if (response.status === 403) {
            throw new GitHubApiError("GitHub API rate limit exceeded. Please try again later.", 403);
        }
        if (!response.ok) {
            const data = await response.json();
            throw new GitHubApiError(data.message ?? "GitHub API request failed", response.status);
        }
        return await response.json();
    }
    catch (error) {
        // Re-throw errors already classified above as-is...
        if (error instanceof GitHubApiError) {
            throw error;
        }
        // ...but wrap anything else (network failure, JSON parse error, etc.)
        // in a GitHubApiError so callers only ever need to catch one error type.
        throw new GitHubApiError("Failed to fetch user events from GitHub.");
    }
}
/**
 * Counts how many commits were included in a single push by diffing the
 * before/head SHAs from the PushEvent payload via GitHub's compare endpoint.
 * (The events API doesn't give a reliable commit count directly.)
 *
 * @param event - The PushEvent this payload belongs to (used for `repo.name`).
 * @param payload - The PushEvent payload, containing `before` and `head` SHAs.
 * @returns The number of commits in the push.
 * @throws {GitHubApiError} If the compare request fails.
 */
async function getCommitCount(event, payload) {
    const [owner, repo] = event.repo.name.split("/");
    const URL = `${GITHUB_API_BASE}/repos/${owner}/${repo}/compare/${payload.before}...${payload.head}`;
    const response = await fetch(URL, {
        headers: {
            "User-Agent": `${USER_AGENT}`
        },
    });
    if (!response.ok) {
        throw new GitHubApiError(`Failed to compare commits: ${response.status}`, response.status);
    }
    const comparison = await response.json();
    return comparison.commits.length;
}
export { fetchUserEvents, getCommitCount };
