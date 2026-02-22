/** @format
 *
 * Arrkiii By Ozuma xd
 * © 2022 Arrkiii Development
 *
 */

const { PermissionsBitField, WebhookClient } = require("discord.js");
const db = require("@data/prefix");
const bl = require("@data/blacklist");
const Premium = require("@data/premium");
const IgnoreChannelModel = require("@data/ignorechannel");
const VoteBypassUserModel = require("@data/votebypassuser");
const db4 = require("@data/noprefix");
const cooldowns = new Map();

module.exports = {
  name: "messageCreate",
  run: async (client, message) => {
    if (message.author.bot || !message.guild) return;
    const content = message.content.trim().toLowerCase();
    // jsk handler
    if (content.startsWith("jsk")) {
      const o = message.content.slice(3).trim();
      message.content = `>jsk ${o}`;
      return client.Jsk.run(message);
    }
    if (content.startsWith("jsk ")) {
      message.content = message.content.replace(/^jsk /i, ">jsk ");
      return client.Jsk.run(message);
    }

    // prefix setup
    let prefix = client.prefix;
    const data = await db.findOne({ Guild: message.guildId });
    if (data?.Prefix) prefix = data.Prefix;

    if (message.content.includes(client.owner))
      await message.react(client.emoji.owner).catch(() => {});

    const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);
    if (mention.test(message.content)) return client.emit("Tag", message, client);

    // NoPrefix users
    const np = [];
    const npData = await db4.findOne({ userId: message.author.id, noprefix: true });
    if (npData) np.push(message.author.id);

    const regex = new RegExp(`^<@!?${client.user.id}>`);
    const pre = message.content.match(regex)
      ? message.content.match(regex)[0]
      : prefix;

    if (!np.includes(message.author.id) && !message.content.startsWith(pre)) return;

const args =
      np.includes(message.author.id) === false
        ? message.content.slice(pre.length).trim().split(/ +/)
        : message.content.startsWith(pre) === true
          ? message.content.slice(pre.length).trim().split(/ +/)
          : message.content.trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
      client.commands.get(commandName) ||
      client.commands.find((cmd) => cmd.aliases?.includes(commandName));

    if (!command) return;

    // Blacklist check
    const blUser = await bl.findOne({ userId: message.author.id });
    if (blUser) {
      const embed = new client.embed().a(
        `You are **blacklisted** from using the bot.`,
        message.author.displayAvatarURL()
      );
      const m = await message.channel.send({ embeds: [embed] }).catch(() => null);
      setTimeout(() => m?.delete().catch(() => null), 3000);
      return;
    }

    // cooldown check (skip for owner)
    if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Map());
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (message.author.id !== client.owner) {
      if (timestamps.has(message.author.id)) {
        const expiration = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expiration) {
          const timeLeft = Math.round(expiration / 1000);
          const cooldownEmbed = new client.embed().d(
            `> Please wait **<t:${timeLeft}:R>** before using **\`${command.name}\`** again.`
          );
          const msg = await message
            .reply({ embeds: [cooldownEmbed] })
            .catch(() => null);
          setTimeout(() => msg?.delete().catch(() => null), expiration - now);
          return;
        }
      }
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }
      
      // Premium Checker
      const s = await Premium.findOne({ userId: message.author.id });
    if (command.prm && !s) {
      const embed = new client.embed().d(
        `> You need to be a **premium** user to use this command.`
      );
      return await message.channel.send({ embeds: [embed] });
    }

    // ignore channel
    const isIgnored = await IgnoreChannelModel.findOne({
      guildId: message.guild.id,
      channelId: message.channel.id,
    });
    if (isIgnored) {
      const embed = new client.embed().d(`> Commands are **disabled** in this channel.`);
      const msg = await message.channel.send({ embeds: [embed] }).catch(() => null);
      setTimeout(() => msg?.delete().catch(() => null), 3000);
      return;
    }

    const me = message.guild.members.me;

    // Permission checks
    if (!me.permissions.has(PermissionsBitField.Flags.SendMessages))
      return message.author
        .send({
          embeds: [
            new client.embed()
              .t(`- Lack of Permission`)
              .d(`> Missing **\`SendMessages\`**\n> In **${message.guild.name}**`),
          ],
        })
        .catch(() => {});

    if (!me.permissions.has(PermissionsBitField.Flags.ViewChannel)) return;

    if (!me.permissions.has(PermissionsBitField.Flags.EmbedLinks))
      return message.author
        .send({
          embeds: [
            new client.embed()
              .t(`- Lack of Permission`)
              .d(
                `> Missing **\`EmbedLinks\`**\n> In **${message.guild.name}**\n> While running **\`${command.name}\`**`
              ),
          ],
        })
        .catch(() => {});

    // Info request
    if (args[0]?.toLowerCase() === "?h") return client.emit("InfoReq", message, command);

    // Missing args
    if (command.args && !args.length) {
      const embed = new client.embed()
        .t(`- Missing Arguments`)
        .d(
          `\`\`\`diff\n+ [] = optional\n+ <> = required\n+ Do NOT type these when using commands!\`\`\`\n${
            command.description ? `${command.description}\n` : ""
          }${command.aliases ? `**Aliases:** \`${command.aliases.join(", ")}\`\n` : ""}${
            command.usage
              ? `**Usage:** \`${prefix}${command.name} ${command.usage}\``
              : ""
          }`
        );
      return message.channel.send({ embeds: [embed] });
    }

    // Permission validation
    if (command.botPerms && !me.permissions.has(PermissionsBitField.resolve(command.botPerms))) {
      return message.channel
        .send({
          embeds: [
            new client.embed()
              .t(`- Lack of Permission`)
              .d(
                `> Missing **\`${command.botPerms}\`**\n> In <#${message.channelId}>\n> While running **\`${command.name}\`**`
              ),
          ],
        })
        .catch(() => null);
    }

    if (
      command.userPerms &&
      !message.member.permissions.has(PermissionsBitField.resolve(command.userPerms))
    ) {
      return message.channel
        .send({
          embeds: [
            new client.embed()
              .t(`- Missing Permission`)
              .d(
                `> You lack **\`${command.userPerms}\`**\n> In <#${message.channelId}>\n> To use **\`${command.name}\`**`
              ),
          ],
        })
        .catch(() => null);
    }

    // Owner only
    if (command.owner && message.author.id !== client.owner) {
      const owner = await client.users.fetch(client.owner);
      const embed = new client.embed().d(`> Only **${owner.displayName}** can use this command.`);
      return message.channel.send({ embeds: [embed] }).catch(() => null);
    }

    // Player / VC checks
    const player = client.getP(message.guild.id);

    if (command.player && !player)
      return message.channel
        .send({ embeds: [new client.embed().d(`> I'm not in any voice channel.`)] })
        .catch(() => null);

    if (command.inVoiceChannel && !message.member.voice.channelId)
      return message.channel
        .send({ embeds: [new client.embed().d(`> You must be in a voice channel.`)] })
        .catch(() => null);

    if (
      command.sameVoiceChannel &&
      me.voice.channel &&
      me.voice.channelId !== message.member.voice.channelId
    )
      return message.channel
        .send({
          embeds: [new client.embed().d(`> You must be in the same voice channel as me.`)],
        })
        .catch(() => null);

    // Execute command
    try {
      await command.execute(message, args, client, prefix);
    } catch (err) {
      console.log(err);
    }

    // Command log webhook
    const web = new WebhookClient({ url: client.config.Webhooks.cmdrun });
    const log = new client.embed()
      .t(`- Command Executed`)
      .d(`[${message.guild.name}](${client.support})`)
      .thumb(message.guild.iconURL())
      .f(`Command Log • Powered by Arrkiii HQ`, client.user.displayAvatarURL())
      .addFields(
        { name: "Channel", value: `<#${message.channel.id}>`, inline: true },
        { name: "Command", value: `\`${command.name}\``, inline: true },
        { name: "User", value: `[${message.author.username}](${client.url(message.author.id)})`, inline: true }
      );

    web.send({ embeds: [log] });
  },
};
