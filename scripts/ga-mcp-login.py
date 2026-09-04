#!/usr/bin/env python3
"""Browser-free Google login for the Google Analytics MCP server.

The container has no browser and the gcloud CLI cannot be installed here
(dl.google.com is blocked by the egress policy), so this uses Google's OAuth
device flow: it prints a URL and a code, you approve on your own machine, and
the resulting refresh token is written to the standard Application Default
Credentials path that the MCP server reads.

Prerequisite: an OAuth client of type "TVs and Limited Input devices" in your
Google Cloud project (APIs & Services -> Credentials -> Create credentials ->
OAuth client ID). Export its id/secret, then run this script:

    export GA_OAUTH_CLIENT_ID=...apps.googleusercontent.com
    export GA_OAUTH_CLIENT_SECRET=...
    export GOOGLE_PROJECT_ID=your-project-id
    python3 scripts/ga-mcp-login.py
"""

import json
import os
import pathlib
import sys
import time
import urllib.parse
import urllib.request

DEVICE_CODE_URL = "https://oauth2.googleapis.com/device/code"
TOKEN_URL = "https://oauth2.googleapis.com/token"
SCOPES = "https://www.googleapis.com/auth/analytics.readonly"
ADC_PATH = pathlib.Path.home() / ".config" / "gcloud" / "application_default_credentials.json"


def post(url, fields):
    data = urllib.parse.urlencode(fields).encode()
    req = urllib.request.Request(url, data=data)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as exc:
        return json.loads(exc.read().decode())


def main():
    client_id = os.environ.get("GA_OAUTH_CLIENT_ID")
    client_secret = os.environ.get("GA_OAUTH_CLIENT_SECRET")
    if not client_id or not client_secret:
        sys.exit(
            "Set GA_OAUTH_CLIENT_ID and GA_OAUTH_CLIENT_SECRET first.\n"
            "Create them at https://console.cloud.google.com/apis/credentials\n"
            'using the "TVs and Limited Input devices" application type.'
        )

    start = post(DEVICE_CODE_URL, {"client_id": client_id, "scope": SCOPES})
    if "device_code" not in start:
        sys.exit(f"Could not start the device flow: {start}")

    print()
    print("  1. Open:  " + start["verification_url"])
    print("  2. Enter code:  " + start["user_code"])
    print("  3. Sign in as a user with access to your Analytics properties.")
    print()
    print("Waiting for approval...", flush=True)

    interval = int(start.get("interval", 5))
    deadline = time.time() + int(start.get("expires_in", 1800))

    while time.time() < deadline:
        time.sleep(interval)
        token = post(
            TOKEN_URL,
            {
                "client_id": client_id,
                "client_secret": client_secret,
                "device_code": start["device_code"],
                "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
            },
        )
        error = token.get("error")
        if error == "authorization_pending":
            continue
        if error == "slow_down":
            interval += 5
            continue
        if error:
            sys.exit(f"Login failed: {token.get('error_description', error)}")

        adc = {
            "type": "authorized_user",
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": token["refresh_token"],
        }
        project = os.environ.get("GOOGLE_PROJECT_ID")
        if project:
            adc["quota_project_id"] = project

        ADC_PATH.parent.mkdir(parents=True, exist_ok=True)
        ADC_PATH.write_text(json.dumps(adc, indent=2))
        ADC_PATH.chmod(0o600)
        print(f"\nCredentials saved to: {ADC_PATH}")
        print("Restart Claude Code so the analytics-mcp server picks them up.")
        return

    sys.exit("The device code expired before it was approved. Run the script again.")


if __name__ == "__main__":
    main()
