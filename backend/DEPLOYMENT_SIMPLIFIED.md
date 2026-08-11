# Backend deployment — moved

This described deploying the backend to **Railway**. It now runs on **Render**,
configured by [render.yaml](../render.yaml).

### 👉 [DEPLOYMENT.md](../DEPLOYMENT.md)

That covers environment variables (including which ones the server refuses to
boot without), migrations, seeding on a shell-less free tier, and
troubleshooting.

For the API surface, the authoritative source is the policy table in
[security/accessControl.js](security/accessControl.js) — the endpoint list that
used to live here was already out of date.

Kept as a pointer so existing links do not lead anywhere misleading. Safe to
delete once everyone has updated their links.
