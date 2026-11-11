# Channel Master Slash Bot

A modern Discord.js v14 join-to-create bot inspired by Milrato-Development/Channel-Master.

## Commands
`/setup channel: category:` and `/disable` (Manage Server permission)

`/voice name`, `limit`, `lock`, `unlock`, `hide`, `reveal`, `permit`, `reject`, `kick`, `claim`, `transfer`, `info`.

## Setup
1. Create an application and bot at https://discord.com/developers/applications.
2. Invite it with `bot` and `applications.commands` scopes. Grant Manage Channels, Move Members, View Channels and Connect permissions.
3. Copy `.env.example` to `.env`, enter bot token and application ID; optionally set `GUILD_ID` for immediate test-server command registration.
4. Run `npm install`, `npm run deploy`, then `npm start`.
5. In Discord run `/setup channel:#Join-to-Create` and optionally choose a category.

## Render
Use `render.yaml` Blueprint (Background Worker, paid plan may be required). Set environment variables in Render. Deploy slash commands once locally with `npm run deploy` (or via a one-off job), then start the worker. Never commit your `.env`.

## Important persistence note
`data.json` stores guild setup and channel ownership locally. Render's ephemeral filesystem loses this data on redeploy/restart unless you attach a persistent disk or replace storage with a database. For production, use persistent storage and restrict bot permissions to what it needs.

## Credits and license
Inspired by https://github.com/Milrato-Development/Channel-Master (GPL-3.0). This implementation is independently written, not a copy of the repository files. If you incorporate code from the original project, comply with its GPL-3.0 license and retain its notices.
