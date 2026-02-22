const { EmbedBuilder } = require("discord.js");
const db = require("@data/247");

module.exports = {
  name: "247",
  category: "Config",
  description: "To force skip the current playing song.",
  userPrams: ["ManageGuild"],
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  cooldown: 3,
  execute: async (message, args, client, prefix) => {
    const player = client.manager.players.get(message.guild.id);
    let data = await db.findOne({ Guild: message.guild.id });
    if (data) {
      await data.deleteOne();
      const thing = new client.embed()
      .a(`- 247 Mode is Disabled`,message.author.displayAvatarURL()
      );
      message.reply({ embeds: [thing] });
    } else {
      data = new db({
        Guild: player.guildId,
        TextId: player.textId,
        VoiceId: player.voiceId,
      });
      await data.save();
      const thing = new client.embed()
        .a(`- 247 Mode is Enabled`,message.author.displayAvatarURL(),
        );
      message.reply({ embeds: [thing] });
    }
  },
};
