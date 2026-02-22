/** @format */
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
} = require("discord.js");
const Engine = require("@data/engine");
const VcStatus = require("@data/vcstatus");

module.exports = {
  name: "toggle",
  category: "Config",
  description:
    "Enable or disable VC status, or switch engine preference.",
  args: true,
  prm: true,
  usage: "<vcstatus | engine>",
  userPrams: ["ManageGuild"],
  botPrams: ["ManageGuild"],
  cooldown: 3,

  execute: async (message, args, client, prefix) => {
    const option = args[0]?.toLowerCase();
    if (!option || !["vcstatus", "engine"].includes(option)) {
      const errorContainer = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("# Invalid Usage"),
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Usage:** \`${prefix}toggle <vcstatus | engine>\`\n\n**Available Options:**\n• \`vcstatus\`\n• \`engine\``,
          ),
        );

      return message.reply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    let container, buttonRow; // ================= VCSTATUS =================

    if (option === "vcstatus") {
      const guildId = message.guild.id;
      const existing = await VcStatus.findOne({ guildId });

      container = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# ${client.emoji.config} **VC Status Configuration**`,
          ),
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${client.emoji.dot} **Current Status:** ${existing ? "**ENABLED**" : "**DISABLED**"}\n\n` +
              (existing
                ? "VC status system is currently active."
                : "VC status system is currently inactive."),
          ),
        )
        .addSeparatorComponents(new SeparatorBuilder());

      buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("toggle_vcstatus")
          .setLabel(existing ? "Disable VC Status" : "Enable VC Status")
          .setStyle(existing ? ButtonStyle.Danger : ButtonStyle.Success),
      );
    }
      else if (option === "engine") {
      // ================= ENGINE =================
      const guildId = message.guild.id;
      const userId = message.author.id;

      const userPref = await Engine.findOne({ userId, guildId: { $eq: null } });
      const guildPref = await Engine.findOne({
        guildId,
        userId: { $eq: null },
      });

      const currentUserEngine = userPref ? userPref.engine : "youtube";
      const currentGuildEngine = guildPref ? guildPref.engine : "youtube";

      const sor = {
        ytsearch: "YouTube",
        spsearch: "Spotify",
        scsearch: "SoundCloud",
        jssearch: "JioSaavn",
        ytmsearch: "YouTube Music",
      };

      const container = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# ${client.emoji.config} **Engine Configuration**`,
          ),
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${client.emoji.dot} **Your Engine:** ${sor[currentUserEngine] || "Youtube"}\n${client.emoji.dot} **Guild's Engine:** ${sor[currentGuildEngine] || "Youtube"}\n\n-# Select a new engine or reset to default.`,
          ),
        );

      const engineOptions = [
        { label: "YouTube", value: "ytsearch", emoji: client.emoji.youtube },
        { label: "Spotify", value: "spsearch", emoji: client.emoji.spotify },
        {
          label: "SoundCloud",
          value: "scsearch",
          emoji: client.emoji.soundcloud,
        }, // { label: "JioSaavn", value: "jssearch", emoji: "🎧" },
        {
          label: "YouTube Music",
          value: "ytmsearch",
          emoji: client.emoji.youtube,
        },
      ];

      const userSelect = new StringSelectMenuBuilder()
        .setCustomId("engine_user")
        .setPlaceholder("Select Your Personal Engine")
        .addOptions(engineOptions);

      const guildSelect = new StringSelectMenuBuilder()
        .setCustomId("engine_guild")
        .setPlaceholder("Select The Guild's Default Engine")
        .addOptions(engineOptions);

      const resetUserButton = new ButtonBuilder()
        .setCustomId("reset_engine_user")
        .setLabel("Reset User Engine")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(userPref ? false : true);

      const resetGuildButton = new ButtonBuilder()
        .setCustomId("reset_engine_guild")
        .setLabel("Reset Guild Engine")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(guildPref ? false : true);

      const row1 = new ActionRowBuilder().addComponents(userSelect);
      const row2 = new ActionRowBuilder().addComponents(guildSelect);
      const row3 = new ActionRowBuilder().addComponents(
        resetUserButton,
        resetGuildButton,
      );

      const msg = await message.reply({
        components: [container, row1, row2, row3],
        flags: MessageFlags.IsComponentsV2,
      });

      const collector = msg.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === userId,
        time: 60000,
      });

      collector.on("collect", async (interaction) => {
        try {
          let successContainer;

          if (interaction.isStringSelectMenu()) {
            const choice = interaction.values[0];
            const engineLabel =
              engineOptions.find(
                (e) => e.label.toLowerCase() === choice.replace("search", ""),
              )?.label || choice;

            if (interaction.customId === "engine_user") {
              await Engine.findOneAndUpdate(
                { userId, guildId: null },
                { engine: choice, updatedAt: Date.now() },
                { upsert: true },
              );
              successContainer =
                new ContainerBuilder().addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    `# User Engine Updated\n\n**Success!** Your personal engine is now set to **${engineLabel}**.`,
                  ),
                );
            }

            if (interaction.customId === "engine_guild") {
              await Engine.findOneAndUpdate(
                { guildId, userId: null },
                { engine: choice, updatedAt: Date.now() },
                { upsert: true },
              );
              successContainer =
                new ContainerBuilder().addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    `# Guild Engine Updated\n\n**Success!** The guild engine is now set to **${engineLabel}**.`,
                  ),
                );
            }
          }

          if (interaction.isButton()) {
            if (interaction.customId === "reset_engine_user") {
              await Engine.deleteOne({ userId, guildId: null });
              successContainer =
                new ContainerBuilder().addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    "# User Engine Reset\n\n**Success!** Your engine is reset to default.",
                  ),
                );
            }

            if (interaction.customId === "reset_engine_guild") {
              if (
                !interaction.member.permissions.has(
                  PermissionsBitField.Flags.ManageGuild,
                )
              ) {
                return interaction.reply({
                  content:
                    "You require `Manage Guild` permission to perform this action.",
                  ephemeral: true,
                });
              }
              await Engine.deleteOne({ guildId, userId: null });
              successContainer =
                new ContainerBuilder().addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    "# Guild Engine Reset\n\n**Success!** The guild's engine is reset to default.",
                  ),
                );
            }
          }

          if (successContainer) {
            // [!] UPDATED to edit the original message instead of replying
            await interaction.update({
              components: [successContainer],
              flags: MessageFlags.IsComponentsV2,
            });
            collector.stop(); // Stop listening for more interactions
          }
        } catch (err) {
          console.error("Error updating engine:", err);
          await interaction.reply({
            content: "Failed to update engine. Try again later.",
            ephemeral: true,
          });
        }
      });

      collector.on("end", (collected, reason) => {
        // [!] Only edit on timeout, not when stopped manually
        if (reason === "time") {
          msg
            .edit({
              components: [],
              content: "⏰ Engine configuration timed out.",
            })
            .catch(() => {});
        }
      });

      return;
    } // ================= SEND (for vcstatus / 247) =================

    const msg = await message.reply({
      components: [container, buttonRow],
      flags: MessageFlags.IsComponentsV2,
    });

    const collector = msg.createMessageComponentCollector({
      filter: (interaction) => interaction.user.id === message.author.id,
      time: 60000,
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.isButton()) return;

      try {
        let newStatus, successContainer;

        if (interaction.customId === "toggle_vcstatus") {
          const guildId = message.guild.id;
          const existing = await VcStatus.findOne({ guildId });

          if (existing) {
            await VcStatus.deleteOne({ guildId });
            newStatus = "disabled";
          } else {
            await VcStatus.create({ guildId });
            newStatus = "enabled";
          }

          successContainer = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# ✅ VC Status Updated\n\n**Success!** VC status system is now **${newStatus.toUpperCase()}**.`,
            ),
          );
        }

        await interaction.update({
          components: [successContainer],
          flags: MessageFlags.IsComponentsV2,
        });
      } catch (err) {
        console.error("Error toggling:", err);
        await interaction.reply({
          content: "❌ Failed to update setting.",
          ephemeral: true,
        });
      }
    });

    collector.on("end", () => {
      msg
        .edit({ components: [], content: "⏰ Configuration timed out." })
        .catch(() => {});
    });
  },
};
