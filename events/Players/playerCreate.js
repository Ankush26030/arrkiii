const {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  MessageFlags,
  ButtonStyle,
} = require("discord.js");
const { KazagumoPlayer } = require("kazagumo");

module.exports = {
  name: "playerCreate",
  run: async (client, player) => {
    const name = client.guilds.cache.get(player.guildId).name;
    client.logger.log(`Player Create in ${name} [ ${player.guildId} ]`, "log");
    client.rest
      .put(`/channels/${player.voiceId}/voice-status`, {
        body: { status: `**${client.prefix}Play** Name` },
      })
      .catch(() => null);

    const guild = client.guilds.cache.get(player.guildId);
    if (!guild) return;
  },
};
