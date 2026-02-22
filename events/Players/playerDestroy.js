const { WebhookClient } = require("discord.js");

module.exports = {
  name: "playerDestroy",
  run: async (client, player) => {
    try {
      const guild = client.guilds.cache.get(player.guildId);
      if (!guild) return;

      const serverName = guild?.name;
      const serverId = guild?.id;
      const currentTrack = player.queue.current;
      const requesterName = currentTrack?.requester?.displayName;
      const title = currentTrack?.title;
      const thumbnail = currentTrack?.thumbnail;
      const voiceId = player.voiceId;
      if (voiceId)
        client.rest.put(`/channels/${voiceId}/voice-status`, { body: { status: "" } }).catch(() => null);
      const webhook = new WebhookClient({ url: client.config.Webhooks.player_delete });
      await webhook.send({
        embeds: [
          new client.embed()
            .a("Player Destroyed", client.user.displayAvatarURL())
            .thumb(thumbnail)
            .d(
              `**Server:** ${serverName} (\`${serverId}\`)\n` +
              `**Requested By:** ${requesterName}\n` +
              `**Track:** ${title}`
            )
            .f("Music Logs • Powered by Arrkiii HQ",
              client.user.displayAvatarURL())
            .setTimestamp(),
        ],
      });

      client.logger.log(`Player Destroyed in ${serverName} [${serverId}]`, "log");
      const oldMsg = player.data.get("message");
      if (oldMsg && oldMsg.deletable) oldMsg.delete().catch(() => null);
      if (player.data.get("autoplay")) {
        player.data.delete("autoplay");
      }

    } catch (err) {
      client.logger.log(`Error in playerDestroy: ${err.stack ?? err}`, "error");
    }
  },
};
