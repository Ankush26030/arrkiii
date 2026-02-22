const { PermissionsBitField, MessageFlags } = require("discord.js");

module.exports = {
  name: "join",
  aliases: ["j"],
  category: "Music",
  cooldown: 5,
  description: "Joins the voice channel you are in.",
  args: false,
  usage: "Joining a voice channel",
  userPrams: [],
  botPrams: ["EmbedLinks", "Connect", "Speak"],
  inVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    const { channel } = message.member.voice;
    const player = client.manager.players.get(message.guild.id);
    if (player) {
      return await message.channel.send({
        embeds: [
          new client.embed().setDescription(
            `${client.emoji.cross} | I'm already connected to <#${player.voiceId}> voice channel!`,
          ),
        ],
      });
    }

    if (
      !message.guild.members.me.permissions.has(
        PermissionsBitField.resolve(["Speak", "Connect"]),
      )
    )
      return message.channel.send({
        embeds: [
          new client.embed()
            .setColor("2f3136")
            .setDescription(
              `${client.emoji.cross} | I don't have enough permissions connect your vc please give me permission \`CONNECT\` or \`SPEAK\`.`,
            ),
        ],
      });

    await client.manager.createPlayer({
      guildId: message.guild.id,
      voiceId: message.member.voice.channel.id,
      textId: message.channel.id,
      shardId: message.guild.shardId,
      volume: 80,
      deaf: true,
    });
    const arrkiii = client
      .box()
      .text(`# Joined ${channel.name}`)
      .sep()
      .text(`Bond With ${message.channelId}`);
    return message.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [arrkiii],
    });
  },
};
