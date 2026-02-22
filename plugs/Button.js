const { ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = class Button extends ButtonBuilder {
  constructor() {
    super();
  }

  make(customId, label, emoji, style, disabled = false) {
    if (!label && !emoji) throw new Error("A button must have a label or emoji.");

    this.setCustomId(customId)
      .setStyle(style)
      .setDisabled(disabled);

    if (label) this.setLabel(label);
    if (emoji) this.setEmoji(emoji);

    return this;
  }

  p(customId, label, emoji, disabled = false) {
    return this.make(customId, label, emoji, ButtonStyle.Primary, disabled);
  }

  s(customId, label, emoji, disabled = false) {
    return this.make(customId, label, emoji, ButtonStyle.Secondary, disabled);
  }

  d(customId, label, emoji, disabled = false) {
    return this.make(customId, label, emoji, ButtonStyle.Danger, disabled);
  }

  g(customId, label, emoji, disabled = false) {
    return this.make(customId, label, emoji, ButtonStyle.Success, disabled);
  }

  link(label, url) {
    if (!label || !url) throw new Error("Link button requires a label and a valid URL.");
    this.setStyle(ButtonStyle.Link).setLabel(label).setURL(url);
    return this;
  }
};
