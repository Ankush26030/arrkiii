const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "pause",
  category: "Music",
  cooldown: 3,
  description: "Pause the currently playing music",
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
    if (player.shoukaku.paused) {
      const thing = new client.embed()
        .setColor("2f3136")
        .setDescription(
          `${client.emoji.tick} | The player is already **paused**.`,
        );
      return message.reply({ embeds: [thing] });
    }

    await player.pause(true);

    const song = player.queue.current;

    const thing = new client.embed()
      .setColor("2f3136")
      .setDescription(
        `${client.emoji.tick} | **Paused** - [${song.title}](${client.config.links.support})`,
      );
    return message.reply({ embeds: [thing] });
  },
};
