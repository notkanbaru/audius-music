const { Command } = require('klasa');
const {
  Permissions: { FLAGS }
} = require("discord.js");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'play',
      enabled: true,
      runIn: ['text'],
      cooldown: 2,
      bucket: 1,
      aliases: [],
      permLevel: 0,
      botPerms: [],
      requiredConfigs: [],
      description: 'Adds a song to queue from YouTube URL or search term.',
      quotedStringSupport: true,
      usage: '[song:string]',
      usageDelim: '',
      extendedHelp: 'Fetches song by YouTube URL or returns first search parameter, or an uploaded music file.',
    });
    this.exp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/\S*(?:(?:\/e(?:mbed)?)?\/|watch\/?\?(?:\S*?&?v=))|youtu\.be\/)([\w-]{11})(?:[^\w-]|$)/;
  }

  async init() { global.queue = new Map(); }
  
  async run(msg, [song]) {
      let url = song;
      const getLinks = require("../../functions/getLinks");
      const voiceChannel = msg.member.voice.channel;
      const serverQueue = global.queue.get(msg.guild.id)

      if (!voiceChannel) {
        return msg.channel.send(`It seems you aren't in a voice channel.`);
      }

      const permissions = voiceChannel.permissionsFor(msg.client.user);
      if (!permissions.has("CONNECT")) {
        return msg.channel.send(
          `I may not have permissions to connect to vc... could someone please check?`
        );
      }
      if (!permissions.has("SPEAK")) {
        return msg.channel.send(
          `i may not have permissions to speak in vc... could someone please check?`
        );
      }
    
    if(song == undefined && serverQueue && !serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      return msg.channel.send(`I've resumed the music!`);
    } 
    if(song == undefined) throw "you didn't tell me what to play!"
      
      getLinks(msg, url, voiceChannel);
    }
};