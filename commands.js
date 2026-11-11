import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
export const commands = [
 new SlashCommandBuilder().setName('setup').setDescription('Configure join-to-create').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild).addChannelOption(o=>o.setName('channel').setDescription('Join-to-create voice channel').setRequired(true).addChannelTypes(2)).addChannelOption(o=>o.setName('category').setDescription('Category for new voice channels').setRequired(false).addChannelTypes(4)),
 new SlashCommandBuilder().setName('disable').setDescription('Disable join-to-create').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
 new SlashCommandBuilder().setName('voice').setDescription('Manage your temporary voice channel')
 .addSubcommand(s=>s.setName('name').setDescription('Rename your channel').addStringOption(o=>o.setName('value').setDescription('New channel name').setRequired(true).setMaxLength(100)))
 .addSubcommand(s=>s.setName('limit').setDescription('Set user limit (0 for unlimited)').addIntegerOption(o=>o.setName('value').setDescription('Limit').setRequired(true).setMinValue(0).setMaxValue(99)))
 .addSubcommand(s=>s.setName('lock').setDescription('Block new joins'))
 .addSubcommand(s=>s.setName('unlock').setDescription('Allow joins'))
 .addSubcommand(s=>s.setName('hide').setDescription('Hide from other members'))
 .addSubcommand(s=>s.setName('reveal').setDescription('Show to other members'))
 .addSubcommand(s=>s.setName('permit').setDescription('Allow a member to join').addUserOption(o=>o.setName('member').setDescription('Member').setRequired(true)))
 .addSubcommand(s=>s.setName('reject').setDescription('Block a member from joining').addUserOption(o=>o.setName('member').setDescription('Member').setRequired(true)))
 .addSubcommand(s=>s.setName('kick').setDescription('Disconnect a member').addUserOption(o=>o.setName('member').setDescription('Member').setRequired(true)))
 .addSubcommand(s=>s.setName('claim').setDescription('Claim an ownerless temporary channel'))
 .addSubcommand(s=>s.setName('transfer').setDescription('Transfer ownership').addUserOption(o=>o.setName('member').setDescription('New owner').setRequired(true)))
 .addSubcommand(s=>s.setName('info').setDescription('View channel information'))
].map(c=>c.toJSON());
