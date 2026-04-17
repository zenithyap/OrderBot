const { Telegraf } = require("telegraf");
require("dotenv").config();
const path = require("path");

const bot = new Telegraf(process.env.BOT_TOKEN);
const userSelections = new Map(); // userId -> { 'Eevee': 10, 'Vaporeon': 5 }
const pendingSelections = new Map(); // userId -> 'Eevee'

const menu = {
  eeveelutions: {
    name: "Eeveelutions",
    options: [
      "Eevee",
      "Vaporeon",
      "Jolteon",
      "Flareon",
      "Espeon",
      "Umbreon",
      "Leafeon",
      "Glaceon",
      "Sylveon",
    ],
  },
  aboutTheJourney: {
    name: "About the Journey",
    options: [
      "Chasing butterflies",
      "Dancing in the rain",
      "Smelling flowers",
      "Watching sunsets",
      "Making friends",
    ],
  },
  lifeIsTough: {
    name: "Life is Tough",
    options: [
      "No motivation",
      "Werk tough",
      "Low batt",
      "5 more mins",
      "Happy mask on",
    ],
  },
};

const formatText = (string) => {
  return string.toLowerCase().replace(/\s+/g, "_");
};

const formatOrderSummary = (selections) => {
  const items = Object.entries(selections || {});
  if (items.length === 0) return "";
  return items
    .map(([sticker, qty]) => `- ${sticker}: ${qty} stickers`)
    .join("\n");
};

const formatGrid = (gridSize, options, packKey) => {
  const grid = [];
  for (let i = 0; i < gridSize; i++) {
    const row = [];
    for (let j = 0; j < gridSize; j++) {
      const option = options[i * gridSize + j];
      if (option) {
        row.push({
          text: option,
          callback_data: `select_${formatText(option)}|${packKey}`,
        });
      }
    }
    grid.push(row);
  }
  return grid;
};

const startMenu = {
  reply_markup: {
    inline_keyboard: [
      ...Object.values(menu).map((pack) => {
        return [{ text: pack.name, callback_data: formatText(pack.name) }];
      }),
    ],
  },
};

const eeveelutionsMenu = {
  reply_markup: {
    inline_keyboard: formatGrid(3, menu.eeveelutions.options, "eeveelutions")
      .map((row) =>
        row.map((option) => ({
          text: option.text,
          callback_data: option.callback_data,
        })),
      )
      .concat([[{ text: "Back", callback_data: "start" }]]),
  },
};

const aboutTheJourneyMenu = {
  reply_markup: {
    inline_keyboard: formatGrid(
      3,
      menu.aboutTheJourney.options,
      "about_the_journey",
    )
      .map((row) =>
        row.map((option) => ({
          text: option.text,
          callback_data: option.callback_data,
        })),
      )
      .concat([[{ text: "Back", callback_data: "start" }]]),
  },
};

const lifeIsToughMenu = {
  reply_markup: {
    inline_keyboard: formatGrid(3, menu.lifeIsTough.options, "life_is_tough")
      .map((row) =>
        row.map((option) => ({
          text: option.text,
          callback_data: option.callback_data,
        })),
      )
      .concat([[{ text: "Back", callback_data: "start" }]]),
  },
};

const sendStartMenu = (ctx) =>
  ctx.reply(
    "Welcome to MorphyOrderBot! Please select which sticker pack you would like!",
    startMenu,
  );

bot.action("start", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.editMessageText(
    "Welcome to MorphyOrderBot! Please select which sticker pack you would like!",
    startMenu,
  );
});

const sendEeveelutionsMenu = async (ctx) => {
  const selections = userSelections.get(ctx.from.id) || {};
  const summary = formatOrderSummary(selections);
  const text = summary
    ? `Order Summary:\n${summary}\n\nWhich Eeveelution sticker would you like?`
    : "Which Eeveelution sticker would you like?";

  return ctx.editMessageText(text, eeveelutionsMenu);
};

const sendAboutTheJourneyMenu = async (ctx) => {
  return ctx.editMessageText(
    "Remember to enjoy the journey!",
    aboutTheJourneyMenu,
  );
};

const sendLifeIsToughMenu = async (ctx) => {
  return ctx.editMessageText(
    "Life can be tough, but these stickers will help you express yourself!",
    lifeIsToughMenu,
  );
};

bot.action("eeveelutions", async (ctx) => {
  await ctx.answerCbQuery();
  return sendEeveelutionsMenu(ctx);
});

bot.action("about_the_journey", async (ctx) => {
  await ctx.answerCbQuery();
  return sendAboutTheJourneyMenu(ctx);
});

bot.action("life_is_tough", async (ctx) => {
  await ctx.answerCbQuery();
  return sendLifeIsToughMenu(ctx);
});

bot.action(/^select_([^|]+)\|(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const itemKey = ctx.match[1];
  const packKey = ctx.match[2];
  const pack = menu[packKey];
  const item = pack
    ? pack.options.find((option) => formatText(option) === itemKey)
    : itemKey;

  pendingSelections.set(ctx.from.id, { item, pack: packKey });

  const selections = userSelections.get(ctx.from.id) || {};
  const summary = formatOrderSummary(selections);
  const text = summary
    ? `Order Summary:\n${summary}\n\nHow many ${item} stickers would you like?`
    : `How many ${item} stickers would you like?`;

  return ctx.editMessageText(text, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "1", callback_data: "qty_1" },
          { text: "2", callback_data: "qty_2" },
          { text: "3", callback_data: "qty_3" },
        ],
        [
          { text: "4", callback_data: "qty_4" },
          { text: "5", callback_data: "qty_5" },
          { text: "6", callback_data: "qty_6" },
        ],
        [
          { text: "7", callback_data: "qty_7" },
          { text: "8", callback_data: "qty_8" },
          { text: "9", callback_data: "qty_9" },
        ],
        [{ text: "Back", callback_data: packKey || "start" }],
      ],
    },
  });
});

bot.action(/^qty_(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const qty = Number(ctx.match[1]);
  const selection = pendingSelections.get(ctx.from.id);
  if (!selection || !selection.item) {
    return ctx.reply("Please select a sticker first.");
  }

  const selections = userSelections.get(ctx.from.id) || {};
  const item = selection.item;
  selections[item] = (selections[item] || 0) + qty;
  userSelections.set(ctx.from.id, selections);
  pendingSelections.delete(ctx.from.id);

  const summary = Object.entries(selections)
    .map(([eevee, qty]) => `- ${eevee}: ${qty} stickers`)
    .join("\n");

  await ctx.editMessageText(
    `Order Summary:\n${summary}\n\nThank you! Returning to your sticker pack menu...`,
  );

  const packKey = selection.pack;
  if (packKey === "eeveelutions") return sendEeveelutionsMenu(ctx);
  if (packKey === "about_the_journey") return sendAboutTheJourneyMenu(ctx);
  if (packKey === "life_is_tough") return sendLifeIsToughMenu(ctx);
  return sendStartMenu(ctx);
});

bot.command("clearorder", async (ctx) => {
  userSelections.delete(ctx.from.id);
  pendingSelections.delete(ctx.from.id);
  await ctx.reply("Your order has been cleared.");
});

bot.start(sendStartMenu);
// bot.launch(); // Removed for Vercel serverless compatibility - using webhooks instead

module.exports = bot;
