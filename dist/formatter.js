import chalk from "chalk";
import { getCommitCount } from "./github.js";
import {} from "./types.js";
/**
 * Converts a single raw `GitHubEvent` into a human-readable display line.
 *
 * @param event - The GitHub event to format.
 * @param plainText - When true, disables chalk coloring. Used when writing
 * to a `--output` file, since ANSI color codes shouldn't end up in a plain
 * `.txt` file.
 * @returns A formatted, one-line string describing the event.
 */
async function formatEvent(event, plainText) {
    const repo = event.repo.name;
    const bullet = plainText ? "-" : chalk.red("-");
    // format due to event type
    switch (event.type) {
        case "PushEvent": {
            const payload = event.payload;
            // to get number of commits made in a repo u can use the def between `head` and `before`
            // by using the API: GET /repos/{owner}/{repo}/compare/{basehead} where basehead = head - before
            const commitCount = await getCommitCount(event, payload);
            return `${bullet} Pushed ${chalk.blueBright(commitCount)} ${commitCount > 1 ? "commits" : "commit"} to ${event.repo.name}`;
        }
        case ("IssuesEvent"): {
            const payload = event.payload;
            // Distinguish opened/closed issues; anything else (e.g. "reopened")
            // falls back to a generic "Updated" message.
            if (payload.action === "opened") {
                return `${bullet} Opened a ${chalk.red("new")} issue ${chalk.red("in")} ${repo}`;
            }
            if (payload.action === "closed") {
                return `${bullet} Closed an issue ${chalk.red("in")} ${repo}`;
            }
            return `${bullet} Updated an issue ${chalk.red("in")} ${repo}`;
        }
        case ("WatchEvent"): {
            // WatchEvent only ever means "starred" — GitHub has no "unstar" event.
            return `${bullet} Starred ${repo}`;
        }
        case ("CreateEvent"): {
            const payload = event.payload;
            // ref_type tells us whether a repo, branch, or tag was created.
            return `${bullet} Created a ${chalk.red("new")} ${payload.ref_type} ${chalk.red("in")} ${repo}`;
        }
        default:
            // Catch-all for any event type not special-cased above, so nothing
            // is silently dropped from the output.
            return `${bullet} Performed ${event.type} ${chalk.red("on")} ${repo}`;
    }
}
export { formatEvent };
