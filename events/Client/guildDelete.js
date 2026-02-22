const { WebhookClient } = require("discord.js");
const moment = require("moment");

module.exports = {
  name: "guildDelete",
  run: async (client, guild) => {
    try {
      const webhook = new WebhookClient({ url: client.config.Webhooks.guild_leave });
      if (!webhook) return;
      const guildName = guild?.name;
      const guildIcon = guild?.iconURL({ dynamic: true, size: 1024 });
      const memberCount = guild?.memberCount;
      const createdAt = guild.createdAt;
      let owner;
      const ownerId = guild?.ownerId ?? guild.ownerId ?? null;
      if (ownerId) owner = await client.users.fetch(ownerId).catch(() => null);

      const formatTimestamp = (timestamp) =>
        timestamp
          ? `\`${moment.utc(timestamp).format("MMM DD, YYYY [at] HH:mm [UTC]")}\`\n*${moment(timestamp).fromNow()}*`
          : "Unavailable";

      const embed = new client.embed()
        .t(`Bot Removed from Guild:`)
        .thumb(guildIcon)
        .d(`i got removed from **${guildName}**.
All associated configurations and data have been purged.
The bot is now active across **${client.numb(client.guilds.cache.size)}** servers.
        `)
        .addFields([
          {
            name: "Server Name & ID",
            value: `**Name:** \`${guildName}\`\n**ID:** \`${guild.id}\``,
            inline: true,
          },
          {
            name: "Server Owner",
            value: owner
              ? `**User Tag:** \`${owner.tag}\`\n**Owner ID:** \`${owner.id}\``
              : "`Could not retrieve owner details.`",
            inline: true,
          },
          {
            name: "Member Count",
            value: `**${memberCount}** total members`,
            inline: true,
          },
          {
            name: "Server Creation Date",
            value: formatTimestamp(createdAt),
            inline: true,
          },
        ])
        .f(`Log • Powered by Arrkiii HQ`, client.user.displayAvatarURL())
        .setTimestamp();

      await webhook.send({ embeds: [embed] });
    } catch (err) {
      client.logger.log(`guildDelete: ${err}`, "error");
    }
  },
};
