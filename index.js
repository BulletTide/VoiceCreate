const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
const ms = require("ms");
const config = require('./storage/config.json');
const prefix = config.prefix;
const chalk = require("chalk");
const db = require("./storage/cache.json");

exports.bot = bot;
bot.commands = new Discord.Collection();

// Log for any errors
bot.on('error', console.error);

// Turn the bot on
bot.on('ready', async () => {

  try {

    // Command Handler
    const commandFiles = fs.readdirSync("./commands");
    commandFiles.forEach((file) => {
      const command = require(`./commands/${file}`);
      bot.commands.set(command.name, command);
    });

    setTimeout(async function() {
      console.log(chalk.white(`[${chalk.green(`INFO`)}${chalk.white(`] - Connecting...`)}`));
    }, ms('1s'));
    setTimeout(async function() {
      console.log(chalk.white(`[${chalk.green(`INFO`)}${chalk.white(`] - Logged in as: ${bot.user.tag}`)}`));
    }, ms('3s'));
    console.log("");

    bot.user.setPresence({ game: { name: `${config.prefix}voice help` }, status: 'online' })

  } catch(e) {

    console.log(chalk.red(`${e.stack}`));
  }
});

// Bot Function (Voice Channels)
bot.on('voiceStateUpdate', async (oldMember, newMember) => {

  let newUserChannel = newMember.voiceChannel;
  let oldUserChannel = oldMember.voiceChannel;

  // Create a voice channel.
  if(oldUserChannel === undefined) {

    if(!newUserChannel) return;
    if(newUserChannel.name === config.create_voice_channel) {

      if(db[newMember.id]) {

        let ic = newMember.guild.channels.find(c => c.id === db[newMember.id].id);

        await newMember.setVoiceChannel(ic);

        return;
      }

      var parent = newMember.guild.channels.find(c => c.name === config.voice_channels_category) || null;

      let vc = await newMember.guild.createChannel(`${newMember.user.username}'s Channel`, 'voice').then(async v => {

        let na = newMember.guild.roles.find(r => r.id === config.na_role);
        if(!na) return console.log(chalk.red(`[ERROR] - Could not find the (NA) role. Please create it or redefine it.`));
        let eu = newMember.guild.roles.find(r => r.id === config.eu_role);
        if(!eu) return console.log(chalk.red(`[ERROR] - Could not find the (EU) role. Please create it or redefine it.`));
        let ds = newMember.guild.roles.find(r => r.id === config.staff_role);
        if(!ds) return console.log(chalk.red(`[ERROR] - Could not find the (Staff) role. Please create it or redefine it.`));

        v.overwritePermissions(newMember.id, {
          VIEW_CHANNEL: true,
          CONNECT: true
        })
        v.overwritePermissions(newMember.guild.defaultRole, {
          VIEW_CHANNEL: false,
          CONNECT: false,
          SPEAK: false
        })
        v.overwritePermissions(na, {
          VIEW_CHANNEL: true,
          CONNECT: true
        })
        v.overwritePermissions(eu, {
          VIEW_CHANNEL: true,
          CONNECT: true
        })
        v.overwritePermissions(ds, {
          VIEW_CHANNEL: true,
          CONNECT: true
        })

        db[newMember.id] = {
          id: v.id
        }

        db[v.id] = {
          host: newMember.id,
          users: [`${newMember.id}`],
          locked: true
        }

        fs.writeFileSync('./storage/cache.json', JSON.stringify(db));
        await v.setParent(parent);
        await oldMember.setVoiceChannel(v);
      })
    }

    // Check if user is joining a voice channel in the db with their previous voice channel being null.
    if(db[newUserChannel.id]) {

      if(db[newUserChannel.id].users.includes(newMember.id)) return;
      db[newUserChannel.id].users.push(newMember.id);
      fs.writeFileSync('./storage/cache.json', JSON.stringify(db));
    }
  }

  // Leaves a voice channel.
  if(newUserChannel === undefined) {

    if(!db[oldUserChannel.id]) return;

    db[oldUserChannel.id].users.splice(db[oldUserChannel.id].users.indexOf(oldMember.id), 1);
    fs.writeFileSync('./storage/cache.json', JSON.stringify(db));

    if(db[oldUserChannel.id].users.length === 0) {

      let vc = oldMember.guild.channels.find(c => c.name === oldUserChannel.name);
      let host = db[oldUserChannel.id].host;

      delete db[oldUserChannel.id];
      delete db[host];

      fs.writeFileSync('./storage/cache.json', JSON.stringify(db));
      vc.delete();
    }
  }

  // Joins a voice channel if they were previously in one.
  if(oldUserChannel != undefined) {

    if(!newUserChannel) return;

    // Check if user exists.
    if(newUserChannel.name === config.create_voice_channel) {

      if(db[newMember.id]) {

        let vc = newMember.guild.channels.find(c => c.id === db[newMember.id].id);
        newMember.setVoiceChannel(vc);
        return;
      }

      // If user doesn't exist.
      var parent = newMember.guild.channels.find(c => c.name === config.voice_channels_category) || null;

      let vc = await newMember.guild.createChannel(`${newMember.user.username}'s Channel`, 'voice').then(async v => {

        let na = newMember.guild.roles.find(r => r.id === config.na_role);
        if(!na) return console.log(chalk.red(`[ERROR] - Could not find the (NA) role. Please create it or redefine it.`));
        let eu = newMember.guild.roles.find(r => r.id === config.eu_role);
        if(!eu) return console.log(chalk.red(`[ERROR] - Could not find the (EU) role. Please create it or redefine it.`));
        let ds = newMember.guild.roles.find(r => r.id === config.staff_role);
        if(!ds) return console.log(chalk.red(`[ERROR] - Could not find the (Staff) role. Please create it or redefine it.`));

        v.overwritePermissions(newMember.id, {
          VIEW_CHANNEL: true,
          CONNECT: true
        })
        v.overwritePermissions(newMember.guild.defaultRole, {
          VIEW_CHANNEL: false,
          CONNECT: false,
          SPEAK: false
        })
        v.overwritePermissions(na, {
          VIEW_CHANNEL: true,
          CONNECT: true
        })
        v.overwritePermissions(eu, {
          VIEW_CHANNEL: true,
          CONNECT: true
        })
        v.overwritePermissions(ds, {
          PRIORITY_SPEAKER: true,
          VIEW_CHANNEL: true,
          CONNECT: true
        })

        db[newMember.id] = {
          id: v.id,
        }

        db[v.id] = {
          host: newMember.id,
          users: [`${newMember.id}`],
          locked: true
        }

        fs.writeFileSync('./storage/cache.json', JSON.stringify(db));
        await v.setParent(parent);
        await oldMember.setVoiceChannel(v);
      })
    }

    // Check if a user is joining a voice channel in db.
    if(db[newUserChannel.id]) {

      if(db[newUserChannel.id].users.includes(newMember.id)) return;
      db[newUserChannel.id].users.push(newMember.id);
      fs.writeFileSync('./storage/cache.json', JSON.stringify(db));
    }

    // If a user leaves a voice channel in the db.
    if(db[oldUserChannel.id]) {

      db[oldUserChannel.id].users.splice(db[oldUserChannel.id].users.indexOf(oldMember.id), 1);
      fs.writeFileSync('./storage/cache.json', JSON.stringify(db));

      if(db[oldUserChannel.id].users.length === 0) {

        let vc = oldMember.guild.channels.find(c => c.name === oldUserChannel.name);
        let host = db[oldUserChannel.id].host;

        delete db[oldUserChannel.id];
        delete db[host];

        fs.writeFileSync('./storage/cache.json', JSON.stringify(db));
        vc.delete();
      }
    }
  }
})

// Message Listener
bot.on("message", async(message) => {

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift();

  if (message.channel.type != "text") return;
  if (message.author.bot) return;

  if (message.author.bot && message.content.startsWith(prefix)) return;
  if (!message.content.startsWith(prefix)) return;

  let cmd = bot.commands.get(command.toLowerCase());
  if (cmd) cmd.execute(message,args);
});
bot.login(config.token);
