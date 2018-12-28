const Discord = require("discord.js");
const fs = require("fs");
const config = require("../storage/config.json");
const chalk = require("chalk");
const ms = require("ms");
const bl = require("../storage/blacklist.json");

module.exports = {
  name: "blacklist",
  execute: async (message, args) => {

    if(!message.member.roles.some(r=>[config.staff_role].includes(r.id))) return message.author.send(new Discord.RichEmbed().setColor("RED").setDescription(`:x: No Permission`)).catch(error => console.log(chalk.yellow(`[WARN] - User (${message.author.tag}) does not have their DMs enabled.`)));

    if(!args[0]) return message.channel.send(new Discord.RichEmbed().setColor(config.color).setDescription(`Please use \`${config.prefix}blacklist help\` for a list of commands.`));

    if(args[0].toLowerCase() === "help") {

      message.delete();

      let embed = new Discord.RichEmbed()
      .setAuthor(`Atlas Blacklist`, message.guild.iconURL)
      .addField(`**Commands**`, `**${config.prefix}blacklist list** - Check the blacklist\n**${config.prefix}blacklist add <word>** - Add a word to the blacklist\n**${config.prefix}blacklist remove <word>** - Remove a word from the blacklist`)
      .setTimestamp()
      .setFooter(`Coded by Medi#7728 | Version: 1.0.0`)
      .setColor(config.color);

      message.channel.send(`Sliding into your DMs...`).then(msg => msg.delete(3000));

      setTimeout(async function() {
        message.author.send(embed).catch(error => message.channel.send(`${message.author}, please enable your DMs.`));
      }, ms('2s'));
      return;
    }

    if(args[0].toLowerCase() === "add") {

      let word = args[1];
      if(!word) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`:x: **Usage:** \`${config.prefix}blacklist add <word>\``));

      let list = bl[message.guild.id];

      if(!list) {

        bl[message.guild.id] = {
          words: [`${word.toLowerCase()}`]
        }

        fs.writeFileSync('./storage/blacklist.json', JSON.stringify(bl));

        message.channel.send(new Discord.RichEmbed().setColor(config.color).setDescription(`:white_check_mark: **${word}** has been added to the blacklist.`));
        return;
      }

      if(bl[message.guild.id].words.includes(word.toLowerCase())) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`That word has already been added to the blacklist.`));

      bl[message.guild.id].words.push(word.toLowerCase());
      fs.writeFileSync('./storage/blacklist.json', JSON.stringify(bl));

      message.channel.send(new Discord.RichEmbed().setColor(config.color).setDescription(`:white_check_mark: **${word}** has been added to the blacklist.`));
      return;
    }

    if(args[0].toLowerCase() === "remove") {

      let list = bl[message.guild.id];
      if(!list) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`Could not find anything in the database.`));

      let word = args[1];
      if(!word) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`:x: **Usage:** \`${config.prefix}blacklist remove <word>\``));

      if(!bl[message.guild.id].words.includes(word.toLowerCase())) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`Could not find that word in the database.`));

      bl[message.guild.id].words.splice(bl[message.guild.id].words.indexOf(word.toLowerCase()), 1);
      fs.writeFileSync('./storage/blacklist.json', JSON.stringify(bl));

      message.channel.send(new Discord.RichEmbed().setColor(config.color).setDescription(`:white_check_mark: **${word}** has been deleted from the blacklist.`));
      return;
    }

    if(args[0].toLowerCase() === "list") {

      let list = bl[message.guild.id];
      if(!list) return message.channel.send(new Discord.RichEmbed().setColor("RED").setDescription(`Could not find anything in the database.`));

      let words = list.words.join("\n");

      message.channel.send(`Sliding into your DMs...`).then(msg => msg.delete(3000));

      setTimeout(async function() {
        message.author.send(new Discord.RichEmbed().setAuthor(`Atlas Blacklist`, message.guild.iconURL).setColor(config.color).setDescription(words)).catch(error => message.channel.send(`${message.author}, please enable your DMs.`));
      }, ms('2s'));

      return;
    }
  }
}
