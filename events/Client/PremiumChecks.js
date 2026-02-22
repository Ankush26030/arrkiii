/** @format
 *
 * Arrkiii By Ozuma xd
 * © 2022 Arrkiii HQ
 *
 */

const Noprefix = require("@data/noprefix");
const VoteBypassUser = require("@data/votebypassuser");
const cleanExpiredPermissions = async (client) => {
  try {
    const now = new Date();

    const expiredNoprefix = await Noprefix.find({ expiresAt: { $lt: now } });
    for (const entry of expiredNoprefix) {
      try {
        const user = await client.users.fetch(entry.userId);
        if (user) {
          await user.send(
            `Your **NoPrefix** access has expired. Renew to continue using this feature.`,
          );
        }
        client.logger.log(
          `[Cleanup] Removed expired NoPrefix → ${entry.userId}`,
          "log",
        );
      } catch (err) {
        client.logger.log(
          `[Cleanup] NoPrefix notify failed → ${entry.userId}: ${err.message}`,
          "warn",
        );
      }
      await Noprefix.deleteOne({ _id: entry._id });
    }

    const expiredVoteBypass = await VoteBypassUser.find({
      expiresAt: { $lt: now },
    });
    for (const entry of expiredVoteBypass) {
      try {
        const user = await client.users.fetch(entry.userId);
        if (user) {
          await user.send(
            `Your **Vote Bypass** access has expired. Renew to continue using this feature.`,
          );
        }
        client.logger.log(
          `[Cleanup] Removed expired VoteBypass → ${entry.userId}`,
          "log",
        );
      } catch (err) {
        client.logger.log(
          `[Cleanup] VoteBypass notify failed → ${entry.userId}: ${err.message}`,
          "warn",
        );
      }
      await VoteBypassUser.deleteOne({ _id: entry._id });
    }
  } catch (err) {
    console.error(`[Cleanup] Error while cleaning expired permissions:`, err);
  }
};

const initializeCleanup = (client) => {
  if (!client) return console.error("[Cleanup] Client instance required.");

  setInterval(() => cleanExpiredPermissions(client), 60 * 1000);
  client.logger?.log("Premium Checker", "ready");
};

module.exports = initializeCleanup;
