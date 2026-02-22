const { EmbedBuilder, ActionRowBuilder } = require("discord.js");

module.exports = {
  name: "spotify",
  aliases: ["spotify", "spoti"],
  category: "Information",
  description: "to show spotify info",
  args: false,
  usage: "spotify",
  async execute(message, args, client, prefix) {
    const member = message.mentions.members.first() || message.member;
    const spotifyActivity = member.presence.activities.find(
      (activity) => activity.type === 2 && activity.name === "Spotify",
    );
    if (!spotifyActivity) {
      return message.channel.send(
        `${member.displayName} is not listening to Spotify!`,
      );
    }

    const title = spotifyActivity.details;
    const auth = spotifyActivity.state;
    const albumImage = spotifyActivity.assets
      ? spotifyActivity.assets.largeImageURL()
      : null;
    const album = spotifyActivity.assets
      ? spotifyActivity.assets.largeText
      : "Unknown";
    const link = `https://open.spotify.com/track/${spotifyActivity.syncId}`;

    const boobs = new ActionRowBuilder().addComponents(
      new client.button().link(
        `Play On Spotify`,
        `https://open.spotify.com/track/${spotifyActivity.syncId}`,
      ),
    );

    const embed = new client.embed()
      .t(`${member.user.username} is listening to Spotify`)
      .d(
        `Song Name- **[${title}](${link})**\nSong Creater - **[${auth}](${link})**`,
      )
      .setThumbnail(albumImage)
      .setFooter({
        text: "Powered by Spotify",
        iconURL: "https://www.scdn.co/i/_global/favicon.png",
      });
    message.channel.send({ embeds: [embed], components: [boobs] });
  },
};
