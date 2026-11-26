const fs = require('node:fs/promises');
const path = require('node:path');
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  version
} = require('discord.js');
require('dotenv').config();

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Missing DISCORD_TOKEN. Copy .env.example to .env and add your bot token.');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const warningFile = path.join(__dirname, '..', 'data', 'warnings.json');
const voteEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

async function readWarnings() {
  try { return JSON.parse(await fs.readFile(warningFile, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return {}; throw error; }
}
async function saveWarnings(data) {
  await fs.mkdir(path.dirname(warningFile), { recursive: true });
  await fs.writeFile(warningFile, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}
function replyError(interaction, message) {
  const payload = { content: `⚠️ ${message}`, ephemeral: true };
  return interaction.replied || interaction.deferred ? interaction.followUp(payload) : interaction.reply(payload);
}
function reasonFor(interaction, supplied) {
  return supplied || `Action by ${interaction.user.tag}`;
}
function canModerateTarget(interaction, member) {
  if (!member) return 'That user is not currently a member of this server.';
  if (member.id === interaction.user.id) return 'You cannot use this command on yourself.';
  if (member.id === interaction.client.user.id) return 'I cannot use this command on myself.';
  if (member.id === interaction.guild.ownerId) return 'The server owner cannot be moderated.';
  if (!member.moderatable && !member.kickable && !member.bannable) return 'My role is not high enough to moderate that member.';
  return null;
}
function makeEmbed(title, color = 0x5865F2) {
  return new EmbedBuilder().setColor(color).setTitle(title).setTimestamp();
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag} (discord.js ${version})`);
  client.user.setActivity('/help for commands');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  try {
    switch (interaction.commandName) {
      case 'ping':
        return interaction.reply({ content: `🏓 Pong! WebSocket: ${Math.round(client.ws.ping)}ms`, ephemeral: true });
      case 'help': {
        const embed = makeEmbed('BetterBot commands')
          .setDescription('Free, self-hosted community and moderation tools. Moderation commands require the relevant server permissions.')
          .addFields(
            { name: 'Community', value: '`/ping` `/poll` `/serverinfo` `/userinfo` `/avatar`', inline: false },
            { name: 'Moderation', value: '`/clear` `/kick` `/ban` `/timeout` `/untimeout` `/warn` `/warnings`', inline: false }
          )
          .setFooter({ text: 'Need setup help? See the repository README.' });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
      case 'poll': {
        const choices = ['choice1', 'choice2', 'choice3', 'choice4', 'choice5']
          .map(name => interaction.options.getString(name)).filter(Boolean);
        if (new Set(choices.map(choice => choice.toLocaleLowerCase())).size !== choices.length) {
          return replyError(interaction, 'Each poll choice must be different.');
        }
        const embed = makeEmbed(`📊 ${interaction.options.getString('question')}`)
          .setDescription(choices.map((choice, index) => `${voteEmojis[index]}  ${choice}`).join('\n\n'))
          .setFooter({ text: `Poll by ${interaction.user.tag} • React to vote` });
        const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        for (let index = 0; index < choices.length; index++) await message.react(voteEmojis[index]);
        return;
      }
      case 'serverinfo': {
        const guild = interaction.guild;
        const embed = makeEmbed(guild.name)
          .setThumbnail(guild.iconURL({ size: 256 }))
          .addFields(
            { name: 'Members', value: `${guild.memberCount}`, inline: true },
            { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
            { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
            { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
            { name: 'Boost level', value: `${guild.premiumTier}`, inline: true }
          );
        return interaction.reply({ embeds: [embed] });
      }
      case 'userinfo': {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        const embed = makeEmbed(user.tag)
          .setThumbnail(user.displayAvatarURL({ size: 256 }))
          .addFields(
            { name: 'User ID', value: user.id, inline: true },
            { name: 'Account created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
            { name: 'Joined server', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>` : 'Not a current member', inline: true }
          );
        return interaction.reply({ embeds: [embed] });
      }
      case 'avatar': {
        const user = interaction.options.getUser('user') || interaction.user;
        const embed = makeEmbed(`${user.tag}'s avatar`).setImage(user.displayAvatarURL({ size: 1024 }));
        return interaction.reply({ embeds: [embed] });
      }
      case 'clear': {
        const amount = interaction.options.getInteger('amount');
        const channel = interaction.channel;
        if (!channel || !channel.isTextBased() || channel.type === ChannelType.GuildForum) return replyError(interaction, 'This command only works in text channels.');
        if (!channel.permissionsFor(client.user).has(PermissionFlagsBits.ManageMessages)) return replyError(interaction, 'I need the Manage Messages permission in this channel.');
        const deleted = await channel.bulkDelete(amount, true);
        return interaction.reply({ content: `🧹 Deleted ${deleted.size} recent message(s). Messages older than 14 days cannot be bulk-deleted.`, ephemeral: true });
      }
      case 'kick':
      case 'ban':
      case 'timeout':
      case 'untimeout':
      case 'warn':
      case 'warnings': {
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (interaction.commandName !== 'warnings') {
          const issue = canModerateTarget(interaction, member);
          if (issue) return replyError(interaction, issue);
        }
        if (interaction.commandName === 'kick') {
          await member.kick(reasonFor(interaction, interaction.options.getString('reason')));
          return interaction.reply({ content: `👢 Kicked ${user.tag}.`, ephemeral: true });
        }
        if (interaction.commandName === 'ban') {
          const days = interaction.options.getInteger('delete_days') || 0;
          await interaction.guild.members.ban(user, {
            reason: reasonFor(interaction, interaction.options.getString('reason')),
            deleteMessageSeconds: days * 86400
          });
          return interaction.reply({ content: `🔨 Banned ${user.tag}${days ? ` and deleted up to ${days} day(s) of messages` : ''}.`, ephemeral: true });
        }
        if (interaction.commandName === 'timeout') {
          const minutes = interaction.options.getInteger('minutes');
          await member.timeout(minutes * 60 * 1000, reasonFor(interaction, interaction.options.getString('reason')));
          return interaction.reply({ content: `⏳ Timed out ${user.tag} for ${minutes} minute(s).`, ephemeral: true });
        }
        if (interaction.commandName === 'untimeout') {
          await member.timeout(null, reasonFor(interaction, interaction.options.getString('reason')));
          return interaction.reply({ content: `✅ Removed ${user.tag}'s timeout.`, ephemeral: true });
        }
        const warnings = await readWarnings();
        const key = `${interaction.guildId}:${user.id}`;
        if (interaction.commandName === 'warn') {
          const entry = {
            reason: interaction.options.getString('reason'),
            moderatorId: interaction.user.id,
            at: new Date().toISOString()
          };
          warnings[key] ||= [];
          warnings[key].push(entry);
          await saveWarnings(warnings);
          return interaction.reply({ content: `⚠️ Warning recorded for ${user.tag} (warning #${warnings[key].length}).`, ephemeral: true });
        }
        const entries = warnings[key] || [];
        const description = entries.length
          ? entries.slice(-10).map((item, index) => `**${Math.max(1, entries.length - 9) + index}.** ${item.reason} — <@${item.moderatorId}> (<t:${Math.floor(new Date(item.at).getTime() / 1000)}:R>)`).join('\n')
          : 'No warnings recorded.';
        const embed = makeEmbed(`Warnings for ${user.tag}`, 0xF1C40F).setDescription(description).setFooter({ text: `${entries.length} total warning(s); showing up to the latest 10` });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
      default:
        return replyError(interaction, 'Unknown command. Run `/help` to see what I can do.');
    }
  } catch (error) {
    console.error(`Command /${interaction.commandName} failed:`, error);
    if (error.code === 50013) return replyError(interaction, 'I do not have the required permission. Check my role and channel permissions.');
    if (error.code === 50001) return replyError(interaction, 'I do not have access to that resource.');
    return replyError(interaction, 'Something went wrong. Check that my role is high enough and that I have the required permissions.');
  }
});

client.on('error', error => console.error('Discord client error:', error));
process.on('unhandledRejection', error => console.error('Unhandled promise rejection:', error));

client.login(token);
