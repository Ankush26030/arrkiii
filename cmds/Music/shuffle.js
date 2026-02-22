const { MessageFlags, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "shuffle",
  category: "Music",
  description: "Shuffle queue",
  cooldown: 3,
  args: false,
  usage: "",
  userPrams: [],
  botPrams: ["EmbedLinks"],
  dj: true,

  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    const player = client.manager.players.get(message.guild.id);

    if (!player.queue.current) {
      const me = client
        .box()
        .text(`Im Not Playing Any Song!`)
        .sep()
        .text(`Use \`${prefix}play\` to play a song!`);
      return message.channel.send({
        flags: MessageFlags.IsComponentsV2,
        components: [me],
      });
    }
    const thing = new client.embed()
      .setDescription(`${client.emoji.tick} | Shuffled the queue`)
      .setColor("2f3136");
    await player.queue.shuffle();
    return message
      .reply({ embeds: [thing] })
      .catch((error) => client.logger.log(error, "error"));
  },
};
