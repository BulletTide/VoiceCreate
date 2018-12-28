const Discord = require("discord.js");
const config = require("../storage/config.json");
const chalk = require("chalk");
const db = require("../storage/cache.json");
const bl = require("../storage/blacklist.json");
const index = require("../index.js");
const bot = index.bot;
const fs = require("fs");

module.exports = {
  name: "voice",
  execute: async (message, args) => {

    if(!args[0]) return message.channel.send(new Discord.RichEmbed().setColor(config.color).setDescription(`Please use \`${config.prefix}voice help\` for a list of commands.`));

    if(args[0].toLowerCase() === "help") {

      let bcmds = message.guild.channels.find(c => c.name === config.voice_cmds_channel);
      if(message.channel.name != config.voice_cmds_channel) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`Please use commands in ${bcmds}.`));

      if(message.member.roles.some(r=>[config.staff_role].includes(r.id))) {

        let embed = new Discord.RichEmbed()
        .setAuthor(`Atlas Voice`, message.guild.iconURL)
        .addField(`**Commands**`, `**${config.prefix}voice lock** - Lock your channel\n**${config.prefix}voice unlock** - Unlock your voice channel\n**${config.prefix}voice name <name>** - Rename your channel\n**${config.prefix}voice limit <#>** - Change the limit of your channel\n**${config.prefix}voice permit @user** - Give a user access to your channel\n**${config.prefix}voice reject @user** - Remove a user from your channel`)
        .addField(`**ModCommands**`, `**${config.prefix}voice delete <channel-id>** - Delete a channel from the database.`)
        .setFooter(`Coded by Medi#7728 | Version: 1.0.0`)
        .setTimestamp()
        .setColor(config.color);

        message.channel.send(embed);
        return;
      }

      let embed = new Discord.RichEmbed()
      .setAuthor(`Atlas Voice`, message.guild.iconURL)
      .addField(`**Commands**`, `**${config.prefix}voice lock** - Lock your channel\n**${config.prefix}voice unlock** - Unlock your voice channel\n**${config.prefix}voice name <name>** - Rename your channel\n**${config.prefix}voice limit <#>** - Change the limit of your channel\n**${config.prefix}voice permit @user** - Give a user access to your channel\n**${config.prefix}voice reject @user** - Remove a user from your channel`)
      .setFooter(`Coded by Medi#7728 | Version: 1.0.0`)
      .setTimestamp()
      .setColor(config.color);

      message.channel.send(embed);
    }

    // Rename a voice channel
    if(args[0].toLowerCase() === "name") {

      let bcmds = message.guild.channels.find(c => c.name === config.voice_cmds_channel);
      if(message.channel.name != config.voice_cmds_channel) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`Please use commands in ${bcmds}.`));

      if(!db[message.author.id]) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`You do not have a voice channel created.`));

      let name = args.slice(1).join(" ");
      if(!name) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`:x: **Usage:** \`${config.prefix}voice name <new-name>\``));

      let iex = bl[message.guild.id];

      if(iex) {

        if(iex.words.length > 0) {

          let foundT = false;

          for (var i in list) {
            if (message.content.toLowerCase().includes(list[i].toLowerCase())) foundT= true;
          }

          if (foundT) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`:x: Sorry but that word is blacklisted.`));

        }

      }

      let chan = message.guild.channels.find(c => c.id === db[message.author.id].id);

      chan.setName(name);

      message.channel.send(new Discord.RichEmbed().setColor(config.color).setDescription(`📝 ${message.author}, your channel has been renamed.`));
    }

    // Lock a channel
    if(args[0].toLowerCase() === "lock") {

      let bcmds = message.guild.channels.find(c => c.name === config.voice_cmds_channel);
      if(message.channel.name != config.voice_cmds_channel) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`Please use commands in ${bcmds}.`));

      if(!db[message.author.id]) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`You do not have a voice channel created.`));

      let cid = db[message.author.id].id;
      let chan = message.guild.channels.find(c => c.id === cid);

      if(db[cid].locked === true) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`Your channel is already locked.`));
      db[cid].locked = true;
      fs.writeFileSync('./storage/cache.json', JSON.stringify(db));

      chan.overwritePermissions(message.guild.defaultRole, {
        VIEW_CHANNEL: false,
        CONNECT: false,
        SPEAK: false
      })

      chan.overwritePermissions(message.author.id, {
        VIEW_CHANNEL: true,
        CONNECT: true
      })

      message.channel.send(new Discord.RichEmbed().setColor(config.color).setDescription(`🔒 ${message.author}, your channel has been locked.`));
    }

    // Unlock a channel
    if(args[0].toLowerCase() === "unlock") {

      let bcmds = message.guild.channels.find(c => c.name === config.voice_cmds_channel);
      if(message.channel.name != config.voice_cmds_channel) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`Please use commands in ${bcmds}.`));

      if(!db[message.author.id]) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`You do not have a voice channel created.`));

      let cid = db[message.author.id].id;
      let chan = message.guild.channels.find(c => c.id === cid);

      if(db[cid].locked === false) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`Your channel is already unlocked.`));
      db[cid].locked = false;
      fs.writeFileSync('./storage/cache.json', JSON.stringify(db));

      chan.overwritePermissions(message.guild.defaultRole, {
        VIEW_CHANNEL: true,
        CONNECT: true,
        SPEAK: true
      })

      chan.overwritePermissions(message.author.id, {
        VIEW_CHANNEL: true,
        CONNECT: true
      })

      message.channel.send(new Discord.RichEmbed().setColor(config.color).setDescription(`🔓 ${message.author}, your channel has been unlocked.`));
    }

    // Delete a channel from the database
    if(args[0].toLowerCase() === "delete") {

      if(!message.member.roles.some(r=>[config.staff_role].includes(r.id))) return message.author.send(new Discord.RichEmbed().setColor("RED").setDescription(`:x: No Permission`))
      .catch(error => console.log(chalk.yellow(`[WARN] - User (${message.author.tag}) does not have their DMs enabled.`)));

      let cid = args[1];
      if(!cid) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`:x: **Usage:** \`${config.prefix}voice delete <channel-id>\``));
      if(cid.length != 18) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`Please provide a valid channel id.\n_You must have developer mode enabled._`));
      let dch = message.guild.channels.find(c => c.id === cid);
      if(!dch) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`Could not find any channel with that id.`));

      let ci = db[cid];
      if(!ci) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`Could not find any channel with that id in the database.`));

      let ch = db[cid].host;

      delete db[cid];
      delete db[ch];

      fs.writeFileSync('./storage/cache.json', JSON.stringify(db));

      dch.delete().catch(error => console.log(chalk.yellow(`[WARN] - Unknown Channel`)));

      message.channel.send(new Discord.RichEmbed().setColor(config.color).setDescription(`🗑 ${message.author}, ID: **${cid}** was successfully deleted.`));
      return;
    }

    // Set a channels limit
    if(args[0].toLowerCase() === "limit") {

      let bcmds = message.guild.channels.find(c => c.name === config.voice_cmds_channel);
      if(message.channel.name != config.voice_cmds_channel) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`Please use commands in ${bcmds}.`));

      if(!db[message.author.id]) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`You do not have a voice channel created.`));

      let cid = db[message.author.id].id;
      let chan = message.guild.channels.find(c => c.id === cid);

      let limit = args[1];

      if(!limit) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`:x: **Usage:** \`${config.prefix}voice limit <#>\``));
      if(isNaN(limit)) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`Please provide a valid number between 0-99.`));
      if(limit > 99) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`Please provide a valid number between 0-99.`));

      chan.setUserLimit(limit);

      message.channel.send(new Discord.RichEmbed().setColor(config.color).setDescription(`📏 ${message.author}, your channel limit was updated to [**${limit}**].`));
    }

    // Permit a user in your channel
    if(args[0].toLowerCase() === "permit") {

      let bcmds = message.guild.channels.find(c => c.name === config.voice_cmds_channel);
      if(message.channel.name != config.voice_cmds_channel) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`Please use commands in ${bcmds}.`));

      if(!db[message.author.id]) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`You do not have a voice channel created.`));

      let member = message.mentions.members.first();
      if(!member) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`:x: **Usage:** \`${config.prefix}voice permit <@user>\``));

      let cid = db[message.author.id].id;
      if(message.author.id === member.user.id) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`:x: Invalid Operation`));
      if(db[cid].users.includes(member.user.id)) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`**${member.user.username}** already has access to your channel.`));

      let chan = message.guild.channels.find(c => c.id === cid);

      chan.overwritePermissions(member, {
        VIEW_CHANNEL: true,
        CONNECT: true,
        SPEAK: true
      })

      db[cid].users.push(member.user.id);
      fs.writeFileSync('./storage/cache.json', JSON.stringify(db));

      message.channel.send(new Discord.RichEmbed().setColor(config.color).setDescription(`✅ ${message.author}, **${member.user.username}** has been granted access to your channel.`));
    }

    // Restrict a user from your channel
    if(args[0].toLowerCase() === "reject") {

      let bcmds = message.guild.channels.find(c => c.name === config.voice_cmds_channel);
      if(message.channel.name != config.voice_cmds_channel) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`Please use commands in ${bcmds}.`));

      if(!db[message.author.id]) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`You do not have a voice channel created.`));

      let member = message.mentions.members.first();
      if(!member) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`:x: **Usage:** \`${config.prefix}voice reject <@user>\``));

      let cid = db[message.author.id].id;
      if(message.author.id === member.user.id) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`:x: Invalid Operation`));
      let srole = message.guild.roles.find(r => r.id === config.staff_role);
      if(member.roles.has(srole.id) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`🚫 ${message.author}, **${member.user.username}** has higher permission than you.`));
      if(!db[cid].users.includes(member.user.id)) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`**${member.user.username}** does not have access to your channel.`));

      let chan = message.guild.channels.find(c => c.id === cid);

      if(member.voiceChannel) {

        if(member.voiceChannel.id === cid) {

          let temp = await message.guild.createChannel(`kicked`, 'voice');

          await member.setVoiceChannel(temp);

          temp.delete();
        }
      }

      chan.overwritePermissions(member, {
        VIEW_CHANNEL: false,
        CONNECT: false,
        SPEAK: false
      })

      message.channel.send(new Discord.RichEmbed().setColor(config.color).setDescription(`⛔ ${message.author}, **${member.user.username}** no longer has access to your channel.`));
    }
  }
}
