/** @format */

module.exports = {
  token:
    "MTQyNzI3MzcwODM0MjYxMjAwOQ.G1vHSG.TYheLZfuzWK7gH8l2v65EwrcMzOhe9t40Qmq3w",
  prefix: ">",
  ownerID: "504232260548165633",
  SpotifyID: "aece5b4d7d27426ebef592a75bd43a2c",
  SpotifySecret: "79a8a54525324e9aa3291eeb880ff287",
  mongourl:
    "mongodb+srv://arrkiii:xzitt@cluster0.bgumof7.mongodb.net/ArrkiiiDB?retryWrites=true&w=majority",
  embedColor: "#2f3136",
  logs: "1187495874952179835",
  node_source: "ytsearch",
  topgg:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJib3QiOiJ0cnVlIiwiaWQiOiIxMDMzNDk2NzA4OTkyMjA0ODQwIiwiaWF0IjoiMTc1OTE1OTQ0OCJ9.t_-N4owFSIKVCPeJ9B1RCEd9GsYkI3WxLcNryAneEok",
  links: {
    hosting: "https://vps.heavencloud.in",
    BG: "https://cdn.discordapp.com/attachments/1061636453437804544/1186002755924525166/20231217_232106.jpg",
    website: "https://arrkiii.fun",
    support: "https://discord.gg/urV9mkfW9t",
    invite:
      "https://discord.com/api/oauth2/authorize?client_id=1033496708992204840&permissions=824671333721&scope=bot",
    arrkiii:
      "https://cdn.discordapp.com/attachments/1187323477032697867/1236626903847407696/Arrkiii.gif",
    power: "Powered By Arrkiii HQ",
    vanity: "discord.gg/urV9mkfW9t",
    guild: "1325384856477368420",
    voteuri: "https://top.gg/bot/1033496708992204840/vote",
  },
  Webhooks: {
    error:
      "https://discord.com/api/webhooks/1352488503719759912/Ab_Int9r6r55w9s0bTl0EQanXXXZxf7yVw8za2bGoo5EXZA55ROsE7dTJ-eVtzq3EtOq",
    black:
      "https://discord.com/api/webhooks/1352487872367824928/aGZc2QDRnyNw5lDKcDedoRHQhCF1MATcbgepwMdoZ0ntPKhVnFic11FN79TtV_1tgzeM",
    player_create:
      "https://discord.com/api/webhooks/1325403953084497930/UgabBESUxDptrRfSUFgkcH3WTYpY_kmBBrkFmZl3w_h_-dhlM-xfvxQgLPLFnZ1h3qCC",
    player_delete:
      "https://discord.com/api/webhooks/1325404009816653874/5J2hteMb6K3UC9WZKc8czt2r5G8oa72rxWno8oQoDCO_m_O_MAqR3_U7WZ4bNfNhkY9n",
    guild_join:
      "https://discord.com/api/webhooks/1352488201939452038/4g48bhj-q_3vKB1Nzv0gqwG3BxiHVUjwQYeumyUqNjMj6j4xflAJ8Y3MydmCBE6UUrgL",
    guild_leave:
      "https://discord.com/api/webhooks/1352488350208233574/zVl1XbfC8qv64PxPF_DMH9xtUgO0I3obrzKfVjzYJVobjFk7fWcBIjKfSjrjh2Qz210Y",
    cmdrun:
      "https://discord.com/api/webhooks/1325404101714116691/3CjO_k4TiNgIVmUMFFdnFUnbUjognaKnIMtjH2eAhiQVWahTilS3LLzJYlJ_NKS-ouP7",
  },

  nodes: [
    {
      url: process.env.NODE_URL || "77.247.127.5:4012",
      name: process.env.NODE_NAME || "Arrkiii",
      auth: process.env.NODE_AUTH || "manasiscool",
      secure: parseBoolean(process.env.NODE_SECURE || "false"),
    },
  ],
};

/** url: process.env.NODE_URL || "nodeusa.heavencloud.in:2000",
      name: process.env.NODE_NAME || "Arrkiii",
      auth: process.env.NODE_AUTH || "youshallnotpass",
      secure: parseBoolean(process.env.NODE_SECURE || "false"),**/

function parseBoolean(value) {
  if (typeof value === "string") {
    value = value.trim().toLowerCase();
  }
  switch (value) {
    case true:
    case "true":
      return true;
    default:
      return false;
  }
}
