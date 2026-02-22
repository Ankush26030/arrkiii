const { MessageFlags } = require("discord.js");
const Wait = require("util").promisify(setTimeout);

module.exports = {
  name: "volume",
  aliases: ["v", "vol"],
  category: "Music",
  cooldown: 3,
  description: "Change volume of currently playing music",
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

    if (!args.length) {
      const thing = new client.embed()
        .setColor("2f3136")
        .setDescription(
          `${client.emoji.tick} | Player Current Volume: **${player.volume}%**`,
        );
      return message.reply({ embeds: [thing] });
    }

    const volume = Number(args[0]);

    if (!volume || volume < 0 || volume > 1000) {
      const thing = new client.embed()
        .setColor("2f3136")
        .setDescription(
          `${client.emoji.cross} | Usage: **${prefix}volume** <Number of volume between 0 - 100>`,
        );
      return message.reply({ embeds: [thing] });
    }

    await player.setVolume(volume / 1);
    Wait(500);
    if (volume > player.volume) {
      const thing = new client.embed()
        .setColor("2f3136")
        .setDescription(`Volume set to: **${volume}%**`);
      return message.reply({ embeds: [thing] });
    } else if (volume < player.volume) {
      const thing = new client.embed().setDescription(
        `Volume set to: **${volume}%**`,
      );
      return message.reply({ embeds: [thing] });
    } else {
      const thing = new client.embed().setDescription(
        `Volume set to: **${volume}%**`,
      );
      return message.reply({ embeds: [thing] });
    }
  },
};
