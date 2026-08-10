/**
 * A GitHub user who triggered an event (the person who pushed, starred, etc.).
 */
interface GitHubActor {
  id: number
  login: string
  display_login: string
  gravatar_id: string
  url: string
  avatar_url: string
}

/**
 * The repository an event happened in.
 */
interface GitHubRepo {
  id: number
  /** Full repo path in "owner/repo" format. */
  name: string
  url: string
}

/**
 * A single event as returned by `GET /users/{username}/events`.
 *
 * `payload` is intentionally loose (`Record<string, unknown>`) because its
 * shape depends on `type`. Cast it to the matching `*EventPayload` interface
 * below once `type` has been checked in a switch/if.
 */
interface GitHubEvent {
  id: string
  type: string
  actor: GitHubActor
  repo: GitHubRepo
  payload: Record<string, unknown>
  public: boolean
  created_at: string
}

/**
 * Payload shape for `"PushEvent"`.
 * `before`/`head` are commit SHAs used to diff the push and count commits
 * via the `/compare` endpoint.
 */
interface PushEventPayload {
  repository_id: number
  push_id: number
  ref: string
  head: string
  before: string
}

/**
 * Payload shape for `"WatchEvent"` (starring a repo).
 * GitHub only ever sends `"started"` here — there is no "unwatch" event.
 */
interface WatchEventPayload {
  action: "started"
}

/**
 * Payload shape for `"IssuesEvent"` (opening/closing/reopening an issue).
 */
interface IssuesEventPayload {
  action: "opened" | "closed" | "reopened"
  issue: {
    number: number
    title: string
  }
}

/**
 * Payload shape for `"CreateEvent"` (new repo, branch, or tag).
 */
interface CreateEventPayload {
  ref: string
  ref_type: "repository" | "branch" | "tag"
  full_ref: string | null
  master_branch: string
  description: string | null
  pusher_type: string
}

export type { CreateEventPayload, GitHubEvent, IssuesEventPayload, PushEventPayload, WatchEventPayload }
