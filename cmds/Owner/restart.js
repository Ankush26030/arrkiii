const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  MessageFlags,
} = require("discord.js");

module.exports = {
  name: "restart",
  category: "Owner",
  owner: true,
  execute: async (message, args, client, prefix) => {
    const subCmd = args[0]?.toLowerCase();

    /*  if (!["warn", "destroy", "all"].includes(subCmd)) {
          
      const errorContainer = new client.box()
        .text("# ⚠️ Invalid Usage")
        .sep()
        .text(`**Usage:** \`${prefix}restart <warn | destroy | all>\`\n\n**Available Options:**\n• \`warn\`\n• \`destroy\`\n• \`all\``);

      return message.reply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2,
      });
    }
    */

    // --- handle restart warn ---
    if (subCmd === "warn") {
      const players = [...client.manager.players.values()].filter(
        (p) => p.playing
      );
      if (!players.length)
        return message.reply("⚠️ No active players to warn.");

      let sent = 0;
      for (const player of players) {
        const guild = client.guilds.cache.get(player.guildId);
        if (!guild) continue;

        let channel =
          guild.systemChannel ||
          guild.channels.cache.find(
            (c) =>
              c.isTextBased() &&
              guild.members.me
                .permissionsIn(c)
                .has([
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.EmbedLinks,
                ])
          );

        if (!channel) continue;

        try {
          await channel.send({
            embeds: [
              new client.embed()
                .setColor("Yellow")
                .setTitle("⚠️ Bot Restart Notice")
                .setDescription(
                  `The bot will restart soon.\n\n` +
                    `🎵 **Current Song:** ${
                      player.queue.current?.title || "Unknown"
                    }\n` +
                    `👤 **Requester:** ${
                      player.queue.current?.requester || "Unknown"
                    }`
                ),
            ],
          });
          sent++;
        } catch {}
      }

      return message.reply(`✅ Sent warnings in **${sent}** servers.`);
    }

    // --- handle restart destroy ---
    if (subCmd === "destroy") {
      const players = [...client.manager.players.values()].filter(
        (p) => p.playing
      );
      if (!players.length)
        return message.reply("⚠️ No active players to destroy.");

      for (const player of players) {
        try {
          player.destroy();
        } catch {}
      }

      return message.reply(`🛑 Destroyed **${players.length}** players.`);
    }

    // --- handle restart all ---
    if (subCmd === "all") {
      const players = [...client.manager.players.values()].filter(
        (p) => p.playing
      );

      if (!players.length) {
        await message.reply("⚠️ No active players. Restarting shards...");
        return client.cluster.respawnAll();
      }

      let sent = 0;
      for (const player of players) {
        const guild = client.guilds.cache.get(player.guildId);
        if (!guild) continue;

        let channel =
          guild.systemChannel ||
          guild.channels.cache.find(
            (c) =>
              c.isTextBased() &&
              guild.members.me
                .permissionsIn(c)
                .has([
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.EmbedLinks,
                ])
          );

        if (!channel) continue;

        try {
          await channel.send({
            embeds: [
              new client.embed()
                .setColor("Yellow")
                .setTitle("⚠️ Bot Restart Notice")
                .setDescription(
                  `The bot will restart shortly.\n\n` +
                    `🎵 **Current Song:** ${
                      player.queue.current?.title || "Unknown"
                    }\n` +
                    `👤 **Requester:** ${
                      player.queue.current?.requester || "Unknown"
                    }`
                ),
            ],
          });
          sent++;
        } catch {}
      }

      await message.reply(
        `✅ Sent warnings in **${sent}** servers.\n⏳ Destroying players and restarting in 5s...`
      );

      setTimeout(async () => {
        for (const player of players) {
          try {
            player.destroy();
          } catch {}
        }

        await message.channel.send(
          `🛑 Destroyed **${players.length}** players. Restarting shards...`
        );

        console.log("Restarting all shards...");
        await client.cluster.respawnAll();
      }, 5000);

      return;
    }

    // --- default: interactive confirmation (your button UI) ---
    const playingGuilds = [...client.manager.players]
      .map((e) => e[1])
      .filter((p) => p.playing)
      .map((p) => p.guildId);

    const guilds = [];
    for (const id of playingGuilds) {
      const guild = client.guilds.cache.get(id);
      if (guild) {
        guilds.push(
          `${guild.name.substring(0, 15)} | Members: ${guild.memberCount}\n`
        );
      }
    }

    const description =
      guilds.length === 0
        ? `___Currently playing in 0 servers\n\nDo you wish to restart?___`
        : `___Currently playing in:___ \n\n${guilds.join("")}`;

    const embed = new client.embed()
      .setColor(client.color || "#ff0000")
      .setDescription(description);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("restart")
        .setLabel("Restart Bot")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("cancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger)
    );

    const msg = await message.reply({ embeds: [embed], components: [row] });

    const collector = msg.createMessageComponentCollector({
      filter: (interaction) => {
        if (interaction.user.id === message.author.id) return true;
        interaction.reply({
          content: "You can't use this button.",
          ephemeral: true,
        });
        return false;
      },
      time: 60000,
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.deferred) await interaction.deferUpdate();

      if (interaction.customId === "restart") {
        await msg.edit({
          embeds: [
            new client.embed().setDescription(
              "🔄 Restarting all shards... ETA: 10-15s"
            ),
          ],
          components: [],
        });

        console.log("Restarting all shards...");
        await client.cluster.respawnAll();
      } else if (interaction.customId === "cancel") {
        collector.stop();
        await msg.edit({
          embeds: [
            new client.embed().setDescription(
              "❌ Restart operation cancelled."
            ),
          ],
          components: [],
        });
      }
    });
  },
};
