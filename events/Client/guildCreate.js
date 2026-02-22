const { WebhookClient } = require("discord.js");
const moment = require("moment");

module.exports = {
  name: "guildCreate",
  run: async (client, guild) => {
    try {
      const webhook = new WebhookClient({ url: client.config.Webhooks.guild_join });
      if (!webhook) return;
      const owner = await guild.fetchOwner(guild.ownerId).catch(() => null);
      const botGuildCount = client.guilds.cache.size;
      const vanityCode = guild.vanityURLCode;
      const totalMembers = guild.memberCount || 0;
      const approxMembers = guild.approximateMemberCount || totalMembers;
      const embed = new client.embed()
        .t("📈 New Server Joined")
        .d(
          `Successfully joined **${guild.name}**\n` +
          `Now active in **${client.numb(botGuildCount)}** servers`
        )
        .thumb(guild.iconURL({ dynamic: true, size: 1024 }))
        .addFields([
          {
            name: "Server Information",
            value: 
              `**Name:** ${guild.name}\n` +
              `**ID:** \`${guild.id}\`\n` +
              `**Members:** ${client.numb(approxMembers)}`,
            inline: true
          },
          {
            name: "Server Owner",
            value: owner
              ? `**Tag:** ${owner.user.tag}\n**ID:** \`${owner.id}\``
              : `*Unable to fetch owner*`,
            inline: true
          },
          {
            name: "Created",
            value: 
              `${moment.utc(guild.createdAt).format("MMM DD, YYYY")}\n` +
              `*${moment(guild.createdAt).fromNow()}*`,
            inline: true
          },
          {
            name: "Server Links",
            value: 
              `**System Channel:** ${
                guild.systemChannel 
                  ? `<#${guild.systemChannel.id}>` 
                  : "*Not set*"
              }\n` +
              `**Vanity URL:** ${
                vanityCode 
                  ? `[discord.gg/${vanityCode}](https://discord.gg/${vanityCode})` 
                  : "*Not available*"
              }`,
            inline: false
          },
          {
            name: "Server Stats",
            value: 
              `**Channels:** ${guild.channels.cache.size}\n` +
              `**Roles:** ${guild.roles.cache.size}\n` +
              `**Boost Level:** ${guild.premiumTier || 0} (${guild.premiumSubscriptionCount || 0} boosts)`,
            inline: true
          },
          {
            name: "Server Features",
            value: guild.features.length > 0
              ? guild.features.slice(0, 5).map(f => `\`${f}\``).join(", ") + 
                (guild.features.length > 5 ? ` +${guild.features.length - 5} more` : "")
              : "*No special features*",
            inline: true
          }
        ])
        .f(`Powered by Arrkiii HQ`,client.user.displayAvatarURL() 
        )
        .setTimestamp();

      await webhook.send({ embeds: [embed] });
    } catch (err) {
      client.logger.log(`GuildCreate Error: ${err.message}`, 'error');
      console.error(err);
    }
  },
};