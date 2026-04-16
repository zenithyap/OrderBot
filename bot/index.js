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
  if (!eeveelutionFileIds) {
    const message = await ctx.replyWithMediaGroup(
      eevees.map((eevee) => ({
        type: "photo",
        media: {
          source: path.join(__dirname, `../images/eeveelutions/${eevee}.webp`),
        },
        caption: `${eevee} sticker preview`,
      }))
    );
    eeveelutionFileIds = message.map(m => m.photo[0].file_id);
  } else {
    await ctx.replyWithMediaGroup(
      eeveelutionFileIds.map((fileId, index) => ({
        type: "photo",
        media: fileId,
        caption: `${eevees[index]} sticker preview`,
      }))
    );
  }

  return ctx.reply("Which Eeveelution sticker would you like?", {
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
  });
};

bot.start(sendStartMenu);

bot.action("customCrafts", (ctx) =>
  ctx.reply(
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
    },
  ),
);

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

bot.action("eeveelutions", sendEeveelutionsMenu);


bot.action(/^select_(.+)$/, (ctx) => {
  const eevee = ctx.match[1].charAt(0).toUpperCase() + ctx.match[1].slice(1);
  pendingSelections.set(ctx.from.id, eevee);
  ctx.reply(`How many ${eevee} stickers would you like? Please enter a number.`);
});

bot.command('clearorder', (ctx) => {
  userSelections.delete(ctx.from.id);
  pendingSelections.delete(ctx.from.id);
  ctx.reply('Your order has been cleared.');
});

bot.on('text', (ctx) => {
  const text = ctx.message.text;
  const num = parseInt(text);
  if (isNaN(num) || num <= 0) {
    return ctx.reply('Please enter a valid number greater than 0.');
  }
  const item = pendingSelections.get(ctx.from.id);
  if (!item) {
    return; // Ignore if no pending
  }
  const selections = userSelections.get(ctx.from.id) || {};
  selections[item] = (selections[item] || 0) + num;
  userSelections.set(ctx.from.id, selections);
  pendingSelections.delete(ctx.from.id);

  const summary = Object.entries(selections).map(([eevee, qty]) => `- ${eevee}: ${qty} stickers`).join('\n');
  ctx.reply(`Order Summary:\n${summary}\n\nThank you! Returning to Eeveelutions menu...`);
  sendEeveelutionsMenu(ctx);
});

bot.action("start", sendStartMenu);

bot.launch();

module.exports = bot;
