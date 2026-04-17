const { Telegraf } = require("telegraf");
require("dotenv").config();
const path = require("path");

const bot = new Telegraf(process.env.BOT_TOKEN);

let eeveelutionFileIds = null;

const userSelections = new Map(); // userId -> { 'Eevee': 10, 'Vaporeon': 5 }

const pendingSelections = new Map(); // userId -> 'Eevee'

const sendStartMenu = (ctx) =>
  ctx.reply("Welcome to OrderBot! Please select an option", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "ALL THINGS TCG", callback_data: "allThingsTcg" }],
        [{ text: "Custom Crafts @so.art.z", callback_data: "customCrafts" }],
      ],
    },
  });

const sendEeveelutionsMenu = async (ctx) => {
  const menu = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Eevee", callback_data: "select_eevee" },
          { text: "Vaporeon", callback_data: "select_vaporeon" },
          { text: "Jolteon", callback_data: "select_jolteon" },
        ],
        [
          { text: "Flareon", callback_data: "select_flareon" },
          { text: "Espeon", callback_data: "select_espeon" },
          { text: "Umbreon", callback_data: "select_umbreon" },
        ],
        [
          { text: "Leafeon", callback_data: "select_leafeon" },
          { text: "Glaceon", callback_data: "select_glaceon" },
          { text: "Sylveon", callback_data: "select_sylveon" },
        ],
        [{ text: "Back", callback_data: "customCrafts" }],
      ],
    },
  };

  if (ctx.updateType === "callback_query" || ctx.callbackQuery) {
    return ctx.editMessageText("Which Eeveelution sticker would you like?", menu);
  }

  return ctx.reply("Which Eeveelution sticker would you like?", menu);
};

bot.start(sendStartMenu);

bot.action("customCrafts", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.editMessageText(
    "You selected Custom Crafts @so.art.z! Please select which sticker pack you would like!",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Eeveelutions", callback_data: "eeveelutions" }],
          [{ text: "About the Journey", callback_data: "aboutTheJourney" }],
          [{ text: "Life is Tough", callback_data: "lifeIsTough" }],
          [{ text: "Back", callback_data: "start" }],
        ],
      },
    }
  );
});

const eevees = [
  "Eevee",
  "Vaporeon",
  "Jolteon",
  "Flareon",
  "Espeon",
  "Umbreon",
  "Leafeon",
  "Glaceon",
  "Sylveon",
]

bot.action("eeveelutions", async (ctx) => {
  await ctx.answerCbQuery();
  // await ctx.editMessageText("Loading Eeveelutions...", { reply_markup: { inline_keyboard: [] } });
  return sendEeveelutionsMenu(ctx);
});

bot.action(/^select_(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const eevee = ctx.match[1].charAt(0).toUpperCase() + ctx.match[1].slice(1);
  pendingSelections.set(ctx.from.id, eevee);
  return ctx.editMessageText(`How many ${eevee} stickers would you like? Please enter a number.`, {
    reply_markup: { inline_keyboard: [] },
  });
});

bot.command('clearorder', (ctx) => {
  userSelections.delete(ctx.from.id);
  pendingSelections.delete(ctx.from.id);
  ctx.reply('Your order has been cleared.');
});

bot.on('text', async (ctx) => {
  const item = pendingSelections.get(ctx.from.id);
  if (!item) {
    return; // Ignore if no pending
  }
  const text = ctx.message.text;
  const num = parseInt(text);
  if (isNaN(num) || num <= 0) {
    return ctx.reply('Please enter a valid number greater than 0.');
  }
  const selections = userSelections.get(ctx.from.id) || {};
  selections[item] = (selections[item] || 0) + num;
  userSelections.set(ctx.from.id, selections);
  pendingSelections.delete(ctx.from.id);

  const summary = Object.entries(selections).map(([eevee, qty]) => `- ${eevee}: ${qty} stickers`).join('\n');
  await ctx.reply(`Order Summary:\n${summary}\n\nThank you! Returning to Eeveelutions menu...`);
  await sendEeveelutionsMenu(ctx);
});

bot.action("start", async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.editMessageText("Welcome to OrderBot! Please select an option", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "ALL THINGS TCG", callback_data: "allThingsTcg" }],
        [{ text: "Custom Crafts @so.art.z", callback_data: "customCrafts" }],
      ],
    },
  });
});

// bot.launch(); // Removed for Vercel serverless compatibility - using webhooks instead

module.exports = bot;
