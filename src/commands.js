const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Check whether BetterBot is responding.'),
  new SlashCommandBuilder().setName('help').setDescription('Show BetterBot commands.'),
  new SlashCommandBuilder().setName('poll').setDescription('Create a reaction poll (2 to 5 choices).')
    .addStringOption(o => o.setName('question').setDescription('What are you asking?').setRequired(true).setMaxLength(250))
    .addStringOption(o => o.setName('choice1').setDescription('First choice').setRequired(true).setMaxLength(80))
    .addStringOption(o => o.setName('choice2').setDescription('Second choice').setRequired(true).setMaxLength(80))
    .addStringOption(o => o.setName('choice3').setDescription('Optional third choice').setMaxLength(80))
    .addStringOption(o => o.setName('choice4').setDescription('Optional fourth choice').setMaxLength(80))
    .addStringOption(o => o.setName('choice5').setDescription('Optional fifth choice').setMaxLength(80)),
  new SlashCommandBuilder().setName('serverinfo').setDescription('Show information about this server.'),
  new SlashCommandBuilder().setName('userinfo').setDescription('Show information about a server member.')
    .addUserOption(o => o.setName('user').setDescription('Member to look up (defaults to you).')),
  new SlashCommandBuilder().setName('avatar').setDescription('Show a member\'s avatar.')
    .addUserOption(o => o.setName('user').setDescription('Member (defaults to you).')),
  new SlashCommandBuilder().setName('clear').setDescription('Delete up to 100 recent messages.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(o => o.setName('amount').setDescription('Number of messages to delete (1–100).').setRequired(true).setMinValue(1).setMaxValue(100)),
  new SlashCommandBuilder().setName('kick').setDescription('Kick a member from the server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(o => o.setName('user').setDescription('Member to kick.').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for the kick.').setMaxLength(400)),
  new SlashCommandBuilder().setName('ban').setDescription('Ban a member from the server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o => o.setName('user').setDescription('Member to ban.').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for the ban.').setMaxLength(400))
    .addIntegerOption(o => o.setName('delete_days').setDescription('Days of their messages to remove (0–7).').setMinValue(0).setMaxValue(7)),
  new SlashCommandBuilder().setName('timeout').setDescription('Temporarily prevent a member from chatting.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('Member to timeout.').setRequired(true))
    .addIntegerOption(o => o.setName('minutes').setDescription('Duration in minutes (1–40320).').setRequired(true).setMinValue(1).setMaxValue(40320))
    .addStringOption(o => o.setName('reason').setDescription('Reason for the timeout.').setMaxLength(400)),
  new SlashCommandBuilder().setName('untimeout').setDescription('Remove a member\'s timeout.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('Member to untimeout.').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for removing the timeout.').setMaxLength(400)),
  new SlashCommandBuilder().setName('warn').setDescription('Add a warning to a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('Member to warn.').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for the warning.').setRequired(true).setMaxLength(400)),
  new SlashCommandBuilder().setName('warnings').setDescription('View a member\'s warnings.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('Member to check.').setRequired(true))
].map(command => command.toJSON());

module.exports = commands.map(data => ({ toJSON: () => data }));
