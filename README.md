# BetterBot

A free, open-source Discord bot built with Node.js and discord.js. It runs on your own computer; there are no paid APIs, subscriptions, or hosted services required. It is online only while the computer and bot process are running.

## Features

- `/ping` and `/help`
- `/poll` — reaction poll with 2–5 choices
- `/serverinfo`, `/userinfo`, `/avatar`
- `/clear` — remove 1–100 recent messages
- `/kick`, `/ban`, `/timeout`, `/untimeout`
- `/warn`, `/warnings` — warnings saved locally in `data/warnings.json`

## Requirements

- Node.js 18.17 or newer
- A Discord account and a server where you have permission to add bots

## Create and invite the bot

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and create an application named **BetterBot**.
2. In **Bot**, create/reset the bot token. Keep it secret; never paste it into chat or commit it to GitHub.
3. In **OAuth2 → URL Generator**, select scopes `bot` and `applications.commands`.
4. Select only the permissions the bot needs. A good starting set is `View Channels`, `Send Messages`, `Embed Links`, `Read Message History`, `Add Reactions`, `Manage Messages`, `Kick Members`, `Ban Members`, and `Moderate Members`. Open the generated URL and invite it to your server.
5. In **General Information**, copy the Application ID (this is `DISCORD_CLIENT_ID`).
6. Copy the server ID: enable Developer Mode in Discord settings, then right-click your server and choose **Copy Server ID**.

## Install and run

Download/clone this repository, then from its folder:

```bash
npm install
```

Copy `.env.example` to `.env` and fill in the values:

```env
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_client_id_here
DISCORD_GUILD_ID=your_test_server_id_here
```

On Windows, you can copy the file with `copy .env.example .env` in Command Prompt or `Copy-Item .env.example .env` in PowerShell. On macOS/Linux, use `cp .env.example .env`.

Register slash commands, then start the bot:

```bash
npm run deploy
npm start
```

With `DISCORD_GUILD_ID` configured, commands are registered to that server and should appear quickly. If you leave it blank, commands are registered globally and can take longer to appear. Keep the bot process running while you test; press `Ctrl+C` to stop it.

## Permissions and safety

Commands are permission-gated by Discord, and moderation commands are also checked by the API at runtime. Place the bot's role above the roles it must moderate. Discord will not allow it to moderate the server owner or members whose roles are higher than its own. `/clear` only bulk-deletes messages Discord considers recent (up to 14 days).

Warnings are stored on the computer running the bot, not in Discord. Back up `data/warnings.json` if you want to keep them. The file is created automatically after the first `/warn`.

## Troubleshooting

- **Invalid token / login failed:** make sure `DISCORD_TOKEN` is the Bot Token, not the Application ID, and reset it if it was exposed.
- **Commands do not appear:** check the IDs in `.env`, run `npm run deploy` again, and confirm the bot was invited with the `applications.commands` scope.
- **Missing permissions:** grant the needed server/channel permission and move the bot role above the target member's role.
- **Bot goes offline:** it runs locally for free, so it stops when the computer sleeps, shuts down, or the terminal closes.

## License

MIT
