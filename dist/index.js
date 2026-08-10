#!/usr/bin/env node
import chalk from "chalk";
import { writeFile } from "node:fs/promises";
import { GitHubApiError } from "./errors.js";
import { formatEvent } from "./formatter.js";
import { fetchUserEvents } from "./github.js";
import { printUsage } from "./helpers.js";
/**
 * Entry point. Parses CLI args, fetches and formats activity for each
 * requested username, and either prints it to the terminal or writes it
 * to a file if `--output` was passed.
 */
async function main() {
    const args = process.argv.slice(2);
    const outputIndex = args.indexOf("--output");
    // Everything before "--output" is treated as a list of usernames, so
    // multiple usernames can be checked in one run.
    const USERS = outputIndex === -1
        ? args
        : args.slice(0, outputIndex);
    const outputFile = outputIndex === -1
        ? undefined
        : args[outputIndex + 1];
    // No usernames given at all -> show usage and bail.
    if (!USERS.length) {
        printUsage();
        process.exit(1);
    }
    // "--output" was passed but with no filename after it.
    if (outputIndex !== -1 && !outputFile) {
        console.error("Error: --output requires a filename.");
        process.exit(1);
    }
    /** Accumulates lines to write to the output file (only used when --output is set). */
    const output = [];
    for (const username of USERS) {
        const raw = await fetchUserEvents(username);
        // GitHub normally returns an array, but guard against a single-object
        // response just in case.
        const events = Array.isArray(raw)
            ? raw
            : [raw];
        // Format every event in parallel (each formatEvent call may itself make
        // a network request, e.g. PushEvent's commit-count lookup).
        const messages = await Promise.all(events.map((event) => formatEvent(event, Boolean(outputFile))));
        if (outputFile) {
            output.push(`${username}'s GitHub activity`);
            output.push("");
            output.push("Output:");
            output.push(...messages);
            output.push("");
        }
        else {
            console.log(`${chalk.green.bold(username)}'s GitHub activity\n`);
            console.log(chalk.magenta("Output:"));
            messages.forEach((message) => {
                console.log(`${message}`);
            });
            console.log();
        }
    }
    // Only touch the filesystem once, after all usernames have been processed.
    if (outputFile) {
        await writeFile(outputFile, output.join("\n"), "utf8");
    }
}
// Top-level error handling: any GitHubApiError gets a clean one-line message,
// anything unexpected gets logged in full so it's easier to debug.
main().catch((error) => {
    if (error instanceof GitHubApiError) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
    console.error("Unexpected error:", error);
    process.exit(1);
});
