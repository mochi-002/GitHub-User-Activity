# GitHub User Activity

A command-line tool that fetches a GitHub user's recent public activity and
displays it in the terminal — built with zero external libraries for data
fetching, using Node's native `fetch`.

Project idea from [roadmap.sh](https://roadmap.sh/projects/github-user-activity).

## Features

- Fetch recent activity for one or more GitHub usernames in a single run
- Human-readable output for common event types:
  - `PushEvent` → number of commits pushed
  - `IssuesEvent` → opened / closed / updated issue
  - `WatchEvent` → starred repo
  - `CreateEvent` → new repo / branch / tag
  - Any other event type falls back to a generic message so nothing is silently dropped
- Optional `--output <file>` flag to save the activity to a plain text file instead of printing it
- Colored terminal output (via `chalk`)
- Graceful error handling for invalid usernames, rate limiting, and network failures

## Installation

```bash
git clone https://github.com/mochi-002/GitHub-User-Activity.git
cd GitHub-User-Activity
npm install
npm run build
```

## Usage

```bash
github-activity <username>
github-activity <username> --output <filename.txt>
```

You can also pass multiple usernames at once:

```bash
github-activity <username1> <username2>
```

### Examples

```bash
github-activity kamranahmedse
```

```
kamranahmedse's GitHub activity

Output:
- Pushed 3 commits to kamranahmedse/developer-roadmap
- Opened a new issue in kamranahmedse/developer-roadmap
- Starred kamranahmedse/developer-roadmap
```

Save to a file instead of printing:

```bash
github-activity kamranahmedse --output activity.txt
```

## Project Structure

```
├── index.ts       # entry point — CLI arg parsing, orchestration, output
├── github.ts       # fetches events from the GitHub API
├── formatter.ts     # turns raw event JSON into display strings
├── helpers.ts        # usage/help text
├── errors.ts          # custom GitHubApiError class
└── types.ts            # GitHubEvent + per-event payload interfaces
```

## API Reference

Uses the GitHub Events API:

```
GET https://api.github.com/users/<username>/events
```

Commit counts for pushes are resolved via the compare endpoint:

```
GET https://api.github.com/repos/<owner>/<repo>/compare/<before>...<head>
```

## Built With

- TypeScript
- Node.js native `fetch` (no HTTP libraries)
- [chalk](https://github.com/chalk/chalk) for terminal colors
