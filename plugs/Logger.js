/** @format
 *
 * Arrkiii By Ozuma xd
 * © 2022 Arrkiii Development
 *
 */

const moment = require("moment-timezone");
const { WebhookClient, EmbedBuilder, Colors } = require("discord.js");
const figlet = require("figlet");
const Table = require("cli-table3");
const chalk = require("chalk");
const config = require("../config");

class Logger {
  static webhookClient = null;
  static webhookTypes = ["error"];
  static setupWebhook() {
    this.webhookClient = new WebhookClient({ url: config.Webhooks.error });
  }
  static getColorCode(color) {
    const codes = {
      black: "\x1b[30m",
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      magenta: "\x1b[35m",
      cyan: "\x1b[36m",
      white: "\x1b[37m",
      gray: "\x1b[90m",
      reset: "\x1b[0m",
    };
    return codes[color] || codes.reset;
  }

  static log(content, type = "log") {
    if (!this.webhookClient) this.setupWebhook();
    const time = moment().tz("Asia/Kolkata").format("hh:mm:ss A");
    const types = {
      log: { tag: "log", color: chalk.white },
      warn: { tag: "warn", color: chalk.yellow },
      error: { tag: "error", color: chalk.red },
      debug: { tag: "debug", color: chalk.magenta },
      cmd: { tag: "cmd", color: chalk.blue },
      event: { tag: "event", color: chalk.cyan },
      ready: { tag: "ready", color: chalk.green },
    };

    const logType = types[type] || types.log;
    const gray = chalk.gray;

    const tag = logType.tag.padEnd(6);
    const timeStr = time.padEnd(11);

    console.log(
      `${logType.color(tag)} ${gray("@")} ${gray(timeStr)} ${chalk.white("::")} ${logType.color(content)}`
    );

    this.sendToWebhook(content, type, time);
  }
  static startup(botName, prefix, lang, version, nodeVer, storage) {
    console.clear();
    const ascii = figlet.textSync(botName, { font: "Standard" });
    const lines = ascii.split("\n");
    const coloredAscii = lines
      .map((line, i) => {
        const colorFn =
          i % 2 === 0 ? chalk.cyanBright : chalk.blueBright;
        return colorFn(line);
      })
      .join("\n");

    console.log(coloredAscii + "\n");
    const table = new Table({
      head: [chalk.cyan("Setting"), chalk.blue("Value")],
      colWidths: [20, 25],
      style: { border: [] },
    });

    table.push(
      [chalk.white("Prefixes"), chalk.cyan(prefix)],
      [chalk.white("Language"), chalk.cyan(lang)],
      [chalk.white("Arrkiii Version"), chalk.cyan(version)],
      [chalk.white("Node.js Version"), chalk.cyan(nodeVer)],
      [chalk.white("Storage Type"), chalk.cyan(storage)],
    );

    console.log(table.toString());
    console.log(chalk.gray("─────────────────────────────────────────────"));
  }

  static async sendToWebhook(content, type, time) {
    if (!this.webhookClient || !this.webhookTypes.includes(type)) return;

    const embed = new EmbedBuilder()
      .setColor(type === "error" ? Colors.Red : Colors.Blue)
      .setTitle(`Logger - ${type}`)
      .setDescription(content)
      .setTimestamp(new Date())
      .setFooter({ text: `Time: ${time} (Asia/Kolkata)` });

    try {
      await this.webhookClient.send({ embeds: [embed] });
    } catch (err) {
      console.error(chalk.red("error  @ webhook     :: failed to send log"));
    }
  }

  static setWebhookTypes(types = ["error"]) {
    this.webhookTypes = types;
  }
}

module.exports = Logger;
