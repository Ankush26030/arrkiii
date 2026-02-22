const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "memberCount",
  description: "Shows the total member count of the server",
  category: "Information",
  usage: "membercount",
  aliases: ["mcount", "members", "mc"],
  execute: async (message, args, client) => {
    try {
      const { guild } = message;

      const total = guild.memberCount;
      const humans = guild.members.cache.filter((m) => !m.user.bot).size;
      const bots = guild.members.cache.filter((m) => m.user.bot).size;

      const embed = new client.embed()
        .t(`👥 Member Count for ${guild.name}`)
        .addFields(
          { name: "Total Members", value: `${total}`, inline: true },
          { name: "Humans", value: `${humans}`, inline: true },
          { name: "Bots", value: `${bots}`, inline: true },
        )
        .thumb(guild.iconURL({ dynamic: true }))
        .setFooter({ text: `Requested by ${message.author.tag}` });

      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      return message.channel.send("❌ Failed to fetch member count.");
    }
  },
};
