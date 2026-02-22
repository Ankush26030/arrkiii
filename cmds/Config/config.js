const { MessageFlags } = require("discord.js");
const db247 = require("@data/247");

function createConfigContainer(
  prefix,
  is247,
  autoplay,
  client,
  message,
) {
  const x = client
    .box()
    .text(
      `# **Server Configuration**\n-# Status of all configured features for this server.`,
    )
    .sep()
    .text(`> **Server Prefix:** \`${prefix}\``)
    .sep();

  const status247 = is247 ? client.emoji.tick : client.emoji.cross;
  const statusAp = autoplay ? client.emoji.tick : client.emoji.cross;
  const player = client.manager.players.get(message.guild.id);
  const isPlayerActive = !!player;
  x.text(`**Music Player Status**`);
  x.text(
    `> **Player Active:** ${
      isPlayerActive ? client.emoji.tick : client.emoji.cross
    }\n> **24/7 Mode:** ${status247}\n> **Auto-Play:** ${statusAp}`,
  );

  if (isPlayerActive) {
    x.text(
      `> **Text-Channel:** <#${player.textId}>\n> **Voice-Channel:** <#${player.voiceId}>`,
    );
  }

  return [x];
}

module.exports = {
  name: "config",
  category: "Config",
  description: "View the server's current configuration for all features.",
  userPerms: ["ManageGuild"],
  botPerms: ["SendMessages"],
  cooldown: 3,

  execute: async (message, args, client, prefix) => {
    try {
      const player = client.getP(message.guildId);
      const is247 = await db247.findOne({ Guild: message.guild.id });
      const autoplay = player?.data?.get("autoplay") || false;

      const components = createConfigContainer(
        prefix,
        !!is247,
        autoplay,
        client,
        message,
      );

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: components,
      });
    } catch (error) {
      client.logger.log(error, "log");
      await message.reply({
        content: "There was an error fetching the server configuration.",
        ephemeral: true,
      });
    }
  },
};
