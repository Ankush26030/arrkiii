const { MessageFlags, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "previous",
  category: "Music",
  aliases: ["prev", "back"],
  cooldown: 3,
  description: "Plays the previous track from the queue.",
  args: false,
  usage: "",
  userPrams: [],
  botPrams: ["EmbedLinks"],
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
      
    const player = client.getP(message.guildId);
    const { channel } = message.member.voice;

    if (
      !message.guild.members.me.permissions.has(
        PermissionsBitField.resolve(["Speak", "Connect"]),
      )
    ) {
      return message.channel.send({
        content: "I need `CONNECT` and `SPEAK` permissions in this channel.",
      });
    }
    const prevTrack = player.queue.previous[0];
    if (!prevTrack) {
      return message.reply({
        content: `${client.emoji.cross} | No previous track to play!`,
      });
    }
      player.play(player.getPrevious())
      
    const cleanedTitle = client.cleanTitle(prevTrack.title, prevTrack.author);
    const box = client
      .box()
      .text(`${client.emoji.music} Playing Previous Song`)
      .sep()
      .text(`[${cleanedTitle}](${prevTrack.uri})`)
      .text(`Artist: ${prevTrack.author || "Unknown"}`)
      .sep()
      .text(`Duration: ${client.tracktime(prevTrack.length)}`);

    return message.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [box],
    });
  },
};
