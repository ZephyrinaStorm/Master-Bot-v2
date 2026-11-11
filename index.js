import 'dotenv/config';
import fs from 'node:fs';
import {Client,GatewayIntentBits,ChannelType,PermissionFlagsBits,MessageFlags} from 'discord.js';
if(!process.env.DISCORD_TOKEN) throw new Error('DISCORD_TOKEN missing');
const path='./data.json';
let db={guilds:{},channels:{}};
try{db=JSON.parse(fs.readFileSync(path,'utf8'));db.guilds??={};db.channels??={};}catch{}
const save=()=>{const tmp=path+'.tmp';fs.writeFileSync(tmp,JSON.stringify(db,null,2));fs.renameSync(tmp,path);};
const client=new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildVoiceStates]});
client.once('ready',async()=>{console.log(`Online as ${client.user.tag}`);for(const id of Object.keys(db.channels)){const channel=await client.channels.fetch(id).catch(()=>null);if(!channel){delete db.channels[id];continue;}if(channel.members.size===0){await channel.delete('Cleanup empty temporary channel').catch(()=>{});delete db.channels[id];}}save();});
client.on('voiceStateUpdate',async(oldState,newState)=>{
 try{
  const oldId=oldState.channelId,newId=newState.channelId;
  if(newId && newId!==oldId && db.guilds[newState.guild.id]?.trigger===newId){
   const config=db.guilds[newState.guild.id];const member=newState.member;
   const channel=await newState.guild.channels.create({name:`${member.displayName}'s Channel`.slice(0,100),type:ChannelType.GuildVoice,parent:config.category||newState.channel.parentId||undefined,permissionOverwrites:[{id:newState.guild.roles.everyone.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.Connect]},{id:member.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.Connect,PermissionFlagsBits.ManageChannels,PermissionFlagsBits.MoveMembers]}],reason:'Join-to-create'});
   db.channels[channel.id]={owner:member.id,guild:newState.guild.id};save();
   try{await member.voice.setChannel(channel);}catch(e){await channel.delete().catch(()=>{});delete db.channels[channel.id];save();console.error(e);}
  }
  if(oldId && oldId!==newId && db.channels[oldId]){
   const channel=await oldState.guild.channels.fetch(oldId).catch(()=>null);
   if(!channel || channel.members.size===0){if(channel)await channel.delete('Empty temporary channel').catch(()=>{});delete db.channels[oldId];save();}
  }
 }catch(e){console.error('Voice update failed',e);}
});
client.on('interactionCreate',async i=>{
 if(!i.isChatInputCommand()||!i.inGuild())return;
 const reply=async content=>{if(i.replied||i.deferred)await i.followUp({content,flags:MessageFlags.Ephemeral});else await i.reply({content,flags:MessageFlags.Ephemeral});};
 try{
  if(i.commandName==='setup'){
   const trigger=i.options.getChannel('channel',true),category=i.options.getChannel('category');
   db.guilds[i.guildId]={trigger:trigger.id,category:category?.id||trigger.parentId||null};save();return reply(`Join-to-create enabled for ${trigger}.`);
  }
  if(i.commandName==='disable'){delete db.guilds[i.guildId];save();return reply('Join-to-create disabled. Existing channels remain until empty.');}
  if(i.commandName!=='voice')return;
  const sub=i.options.getSubcommand(),channel=i.member.voice?.channel;
  if(!channel||!db.channels[channel.id]||db.channels[channel.id].guild!==i.guildId)return reply('Join a temporary voice channel first.');
  const record=db.channels[channel.id];
  if(sub==='info')return reply(`Channel: ${channel.name}\nOwner: <@${record.owner}>\nLimit: ${channel.userLimit||'Unlimited'}`);
  if(sub==='claim'){
   if(channel.members.has(record.owner))return reply('The current owner is still in this channel.');
   record.owner=i.user.id;save();return reply('You now own this channel.');
  }
  if(record.owner!==i.user.id)return reply('Only the channel owner can use this command.');
  const user=i.options.getUser('member');
  if(['permit','reject','kick','transfer'].includes(sub)){
   if(!user||user.bot)return reply('Choose a human member.');
   if(user.id===i.user.id)return reply('You cannot target yourself.');
  }
  switch(sub){
   case 'name':await channel.setName(i.options.getString('value',true));break;
   case 'limit':await channel.setUserLimit(i.options.getInteger('value',true));break;
   case 'lock':await channel.permissionOverwrites.edit(i.guild.roles.everyone,{Connect:false});break;
   case 'unlock':await channel.permissionOverwrites.edit(i.guild.roles.everyone,{Connect:true});break;
   case 'hide':await channel.permissionOverwrites.edit(i.guild.roles.everyone,{ViewChannel:false});break;
   case 'reveal':await channel.permissionOverwrites.edit(i.guild.roles.everyone,{ViewChannel:true});break;
   case 'permit':await channel.permissionOverwrites.edit(user.id,{Connect:true,ViewChannel:true});break;
   case 'reject':await channel.permissionOverwrites.edit(user.id,{Connect:false});break;
   case 'kick':{
    const target=await i.guild.members.fetch(user.id).catch(()=>null);
    if(!target||target.voice.channelId!==channel.id)return reply('That member is not in your channel.');
    await target.voice.disconnect('Temporary channel owner disconnected member');break;
   }
   case 'transfer':{
    if(!channel.members.has(user.id))return reply('New owner must be in the channel.');
    await channel.permissionOverwrites.edit(user.id,{ViewChannel:true,Connect:true,ManageChannels:true,MoveMembers:true});
    await channel.permissionOverwrites.edit(i.user.id,{ManageChannels:null,MoveMembers:null});
    record.owner=user.id;save();break;
   }
  }
  return reply(`Done: ${sub}.`);
 }catch(e){console.error(e);return reply('Action failed. Check my channel permissions and role position.').catch(()=>{});}
});
client.login(process.env.DISCORD_TOKEN);
