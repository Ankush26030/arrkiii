/** @format
 *
 * Arrkiii By Ozuma xd
 * © 2022 Arrkiii HQ
 *
 */

const { ActivityType } = require("discord.js");

module.exports = {
  name: "clientReady",
  run: async (client) => {
    let srv = 0;
    let xx = 0;

    try {
      if (client.cluster) {
        // Get total guilds + members from all clusters
        const results = await client.cluster.broadcastEval((c) => ({
          servers: c.guilds.cache.size,
          users: c.guilds.cache.reduce((a, g) => a + (g.memberCount || 0), 0),
        }));

        for (const res of results) {
          srv += res.servers;
          xx += res.users;
        }
      } else {
        srv = client.guilds.cache.size;
        xx = client.guilds.cache.reduce((a, g) => a + (g.memberCount || 0), 0);
      }
    } catch (err) {
      client.logger.error("Failed to fetch guild stats: " + err.message);
    }

    const u = client.numb(xx);
    const s = client.numb(srv);

    const owner = client.users.cache.get(client.owner) || { displayName: "Ozuma" };

    client.logger.log(`Made By ${owner.displayName}`, "ready");
    client.logger.log(`${client.user.username} online!`, "ready");
    client.logger.log(
      `Ready on ${s} servers, for a total of ${u} users`,
      "ready"
    );

    const statuses = [
      "Music that never stops",
      "Protecting servers with style",
      `Serving ${s} servers`,
      `Helping ${u} users`,
      "Type >help for commands",
      "Powered by Arrkiii HQ",
      client.config?.links?.vanity || "",
    ];

    setInterval(() => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      client.user.setActivity(status, { type: ActivityType.Listening });
    }, 5000);
  },
};