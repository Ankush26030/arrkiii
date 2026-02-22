const {
  WebhookClient,
  AttachmentBuilder,
  ComponentType,
  MessageFlags,
} = require("discord.js");
const path = require("node:path");
const fs = require("fs");
const Preset = require("@data/preset");
const VcStatus = require("@data/vcstatus");
const {
  createButtonRow,
  createFilterRow,
  getFilterSettings,
} = require("@custom/presets/button");

module.exports = {
  name: "playerStart",
  run: async (client, player, track) => {
    try {
      const guild = client.guilds.cache.get(player.guildId);
      if (!guild) return;

      const title = client.cleanTitle(track.title, track.author).slice(0, 30);
      const author = track.author;
      const total = track.length;
      const thumbnail = track.thumbnail.replace("hqdefault", "maxresdefault");
      const requester = track.requester;
      const durationFormatted = client.tracktime(total);
      const startedAt = Date.now();
      const webhook = new WebhookClient({ url: client.config.Webhooks.player_create });
        
      await webhook.send({
        embeds: [
          new client.embed()
            .a(`Player Started`,
               client.user.displayAvatarURL()
              )
            .thumb(thumbnail ? thumbnail : client.user.displayAvatarURL())
            .d(`**Server:** ${guild ? guild.name : 'Idk'} (${guild ? guild.id : 'Idk'})\n**Requested By:** ${requester ? requester.displayName : client.user.username}\n**Track:** ${title ?  title : 'Idk'}`)
            .f("Music Logs • Powered by Arrkiii HQ", client.user.displayAvatarURL())
            .setTimestamp(),
        ],
      });

      const presetDoc = await Preset.findOne({ userId: track.requester.id });
      const cardPath = presetDoc?.cardPath || "../../custom/presets/card2.js";
      const resolvedCardPath = path.resolve(__dirname, cardPath);

      if (!fs.existsSync(resolvedCardPath)) {
        return client.channels.cache.get(player.textId)?.send({
          content: `${client.emoji.tick} Failed to load player card (file missing).`,
        });
      }

      const buildCard = require(resolvedCardPath);
      const vcData = await VcStatus.findOne({ guildId: guild.id });

      if (vcData) {
        client.rest.put(`/channels/${player.voiceId}/voice-status`, {
          body: { status: `${client.emoji.playing} ${title}` },
        }).catch(() => null);
      }

      const cardBuffer = await buildCard({
        title,
        author,
        thumbnail,
        startTime: "0:00",
        endTime: durationFormatted,
        requester: requester.username,
        progressPercent: 0,
        source: track.sourceName,
      });

      const attachment = new AttachmentBuilder(cardBuffer, { name: "nowplaying.png" });

      const msgBox = client.box().media("attachment://nowplaying.png").sep();
      msgBox.addActionRowComponents(
        createFilterRow(),
        createButtonRow(false, client),
      );

      const msg = await client.channels.cache.get(player.textId)?.send({
        flags: MessageFlags.IsComponentsV2,
        files: [attachment],
        components: [msgBox],
      });

      player.data.set("message", msg);

      const updateInterval = setInterval(async () => {
        if (!player || !player.playing) return clearInterval(updateInterval);

        const elapsed = Date.now() - startedAt;
        const progress = Math.min((elapsed / total) * 100, 100);

        const updatedCard = await buildCard({
          title,
          author,
          thumbnail,
          startTime: client.tracktime(elapsed),
          endTime: durationFormatted,
          requester: requester.username,
          progressPercent: progress,
          source: track.sourceName,
        });

        const updatedAttachment = new AttachmentBuilder(updatedCard, { name: "nowplaying.png" });
        const updatedBox = client.box().media("attachment://nowplaying.png").sep();
        updatedBox.addActionRowComponents(
          createFilterRow(),
          createButtonRow(false, client),
        );

        await msg?.edit({
          flags: MessageFlags.IsComponentsV2,
          files: [updatedAttachment],
          components: [updatedBox],
        }).catch(() => null);

        if (progress >= 100) clearInterval(updateInterval);
      }, 20000);

      const collector = msg.createMessageComponentCollector({
        time: track.duration,
        componentType: ComponentType.MessageComponent,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.member.voice.channelId !== player.voiceId) {
          return interaction.reply({
            content: `${client.emoji.cross} | You must be in the same voice channel.`,
            ephemeral: true,
          });
        }

        if (interaction.isButton()) {
          await handlePlayerButton(interaction, player, updateInterval, client);
        } else if (interaction.isStringSelectMenu()) {
          await handleFilterMenu(interaction, player);
        }
      });
    } catch (err) {
      console.error("Error in playerStart event:", err);
    }
  },
};

async function handlePlayerButton(interaction, player, updateInterval, client) {
  const id = interaction.customId;
  switch (id) {
    case "pause":
      player.pause(true);
      await interaction.update({ components: [createFilterRow(), createButtonRow(true, client)] });
      break;

    case "resume":
      player.pause(false);
      await interaction.update({ components: [createFilterRow(), createButtonRow(false, client)] });
      break;

    case "skip":
      player.skip();
      await interaction.reply({ content: `${client.emoji.skip} | Skipped the track.`, ephemeral: true });
      clearInterval(updateInterval);
      break;

    case "stop":
      player.queue.clear();
      player.data.delete("autoplay");
      player.loop = "none";
      player.playing = false;
      player.paused = false;
      player.autoplay = false;
      await player.skip();
      await client.rest.put(`/channels/${player.voiceId}/voice-status`, { body: { status: "" } }).catch(() => null);
      clearInterval(updateInterval);
      await interaction.reply({ content: `${client.emoji.stop} | Stopped the music.`, ephemeral: true });
      break;

    case "loop":
      player.setLoop(player.loop === "none" ? "track" : "none");
      await interaction.reply({ content: `${client.emoji.loop} | Loop **${player.loop === "none" ? "off" : "on"}**`, ephemeral: true });
      break;

    case "shuffle":
      player.queue.shuffle();
      await interaction.reply({ content: `${client.emoji.shuffle} | Queue shuffled`, ephemeral: true });
      break;
  }
}

async function handleFilterMenu(interaction, player) {
  const filterPayload = getFilterSettings(interaction.guild.id, interaction.values[0]);
  if (!filterPayload) return;

  await interaction.deferReply({ ephemeral: true });
  await player.shoukaku.setFilters(filterPayload);
  await interaction.editReply({ content: `✅ | Applied filter: **${interaction.values[0].replace("but", "")}**` });
}
