const { REST, Routes } = require('discord.js');
require('dotenv').config();
const commands = require('./commands');

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } = process.env;
if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  console.error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID. Copy .env.example to .env and fill them in.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
const route = DISCORD_GUILD_ID
  ? Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID)
  : Routes.applicationCommands(DISCORD_CLIENT_ID);

(async () => {
  try {
    console.log(`Registering ${commands.length} slash commands${DISCORD_GUILD_ID ? ' to the test server' : ' globally'}...`);
    await rest.put(route, { body: commands.map(command => command.toJSON()) });
    console.log('Slash commands registered successfully.');
  } catch (error) {
    console.error('Could not register slash commands:', error.message);
    process.exitCode = 1;
  }
})();
