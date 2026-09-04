# Google Analytics MCP server

[`googleanalytics/google-analytics-mcp`](https://github.com/googleanalytics/google-analytics-mcp)
(PyPI package `analytics-mcp`) exposes the Google Analytics Admin and Data APIs
as MCP tools: `get_account_summaries`, `get_property_details`,
`list_google_ads_links`, `run_report`, `run_funnel_report`,
`get_custom_dimensions_and_metrics`, and `run_realtime_report`.

`.mcp.json` in the repo root registers the server for anyone working in this
project. Claude Code will ask you to approve the project-scoped server the
first time you open the repo — until you do, it shows as *Pending approval*.

Keep the registration in `.mcp.json` only. Defining a server of the same name
in user scope as well makes Claude Code report conflicting scopes, and the
duplicate fails to start.

## 1. Enable the APIs

In your Google Cloud project, enable both:

- [Google Analytics Admin API](https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com)
- [Google Analytics Data API](https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com)

## 2. Install the server

Requires Python 3.10+ and [pipx](https://pipx.pypa.io/stable/#install-pipx):

```bash
pipx install analytics-mcp
```

This puts the `google-analytics-mcp` executable on your `PATH`, which is the
command `.mcp.json` invokes. Make sure `pipx ensurepath` has been run so your
shell can find it.

## 3. Log in

The server reads Application Default Credentials (ADC) that carry the
`https://www.googleapis.com/auth/analytics.readonly` scope, for a Google
account that already has access to the Analytics properties.

### On a machine with a browser

```bash
gcloud auth application-default login \
  --scopes https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/cloud-platform \
  --client-id-file=YOUR_OAUTH_CLIENT_JSON
```

### On a headless box (Claude Code on the web)

The remote container has no browser, and the gcloud CLI cannot be installed
there because `dl.google.com` is blocked by the egress policy. Use the OAuth
device flow instead — you approve the login on your own machine and the token
lands in the container.

1. In [APIs & Services -> Credentials](https://console.cloud.google.com/apis/credentials),
   create an OAuth client ID with application type
   **TVs and Limited Input devices**.
2. Run the helper:

   ```bash
   export GA_OAUTH_CLIENT_ID=...apps.googleusercontent.com
   export GA_OAUTH_CLIENT_SECRET=...
   export GOOGLE_PROJECT_ID=your-project-id
   python3 scripts/ga-mcp-login.py
   ```

3. Open the printed URL, enter the printed code, and sign in. The script writes
   `~/.config/gcloud/application_default_credentials.json`.

Because remote containers are ephemeral, that file is lost when the session
ends. To persist it, set `GOOGLE_PROJECT_ID` and the OAuth client variables as
environment variables on the Claude Code environment and re-run the helper, or
run the server locally instead.

## 4. Verify

```bash
claude mcp list
```

`analytics-mcp` should report **Connected**. Then ask for
`get_account_summaries` to confirm the credentials reach your properties.

## Notes

- Credentials are never committed: `.gitignore` excludes `*.json` credential
  files, and the helper writes outside the repo.
- `GOOGLE_PROJECT_ID` in `.mcp.json` is read from your shell environment; it is
  optional but recommended so API quota is attributed to your project.
