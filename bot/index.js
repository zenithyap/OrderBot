const { Telegraf } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const userSelections = new Map(); // userId -> { 'Eevee': 10, 'Vaporeon': 5 }
const pendingSelections = new Map(); // userId -> 'Eevee'

const menu = {
  eeveelutions: {
    id: "eeveelutions",
    name: "Eeveelutions",
    options: [
      { name: "Eevee", id: "eevee" },
      { name: "Vaporeon", id: "vaporeon" },
      { name: "Jolteon", id: "jolteon" },
      { name: "Flareon", id: "flareon" },
      { name: "Espeon", id: "espeon" },
      { name: "Umbreon", id: "umbreon" },
      { name: "Leafeon", id: "leafeon" },
      { name: "Glaceon", id: "glaceon" },
      { name: "Sylveon", id: "sylveon" },
    ],
  },
  aboutTheJourney: {
    id: "about_the_journey",
    name: "About the Journey",
    options: [
      { name: "Chasing butterflies", id: "chasing_butterflies" },
      { name: "Dancing in the rain", id: "dancing_in_the_rain" },
      { name: "Smelling flowers", id: "smelling_flowers" },
      { name: "Watching sunsets", id: "watching_sunsets" },
      { name: "Making friends", id: "making_friends" },
    ],
  },
  lifeIsTough: {
    id: "life_is_tough",
    name: "Life is Tough",
    options: [
      { name: "No motivation", id: "no_motivation" },
      { name: "Happy mask on", id: "happy_mask_on" },
      { name: "Friday yet?", id: "friday_yet" },
      { name: "5 more mins", id: "5_more_mins" },
      { name: "Low batt", id: "low_batt" },
      { name: "Werk tough", id: "werk_tough" },
    ],
  },
};

const menuById = Object.fromEntries(
  Object.values(menu).map((pack) => [pack.id, pack]),
);

const addOrderSummary = (selections, text) => {
  const items = Object.entries(selections || {});
  if (items.length === 0) return text;
  const orderSummary = items
    .map(([sticker, qty]) => `- ${sticker}: ${qty} stickers`)
    .join("\n");

  return `Order Summary:\n${orderSummary}\n\n${text}`;
};

const formatGrid = (gridRow, gridCol, options, packKey) => {
  const grid = [];
  for (let i = 0; i < gridRow; i++) {
    const row = [];
    for (let j = 0; j < gridCol; j++) {
      const option = options[i * gridCol + j];
      if (option) {
        row.push({
          text: option.name,
          callback_data: `select_${option.id}|${packKey}`,
        });
      }
    }
    grid.push(row);
  }
  return grid;
};

const getMenu = (userId, gridRow, gridCol, options, id, backId) => {
  const inlineKeyboard = formatGrid(gridRow, gridCol, options, id).map((row) =>
    row.map((option) => ({
      text: option.text,
      callback_data: option.callback_data,
    })),
  );
  const selections = userSelections.get(userId) || {};
  if (Object.keys(selections).length > 0) {
    inlineKeyboard.push([
      { text: "Clear Order 🗑️", callback_data: "clearorder" },
      { text: "Checkout 🛒", callback_data: "checkout" },
    ]);
  }
  if (backId) {
    inlineKeyboard.push([{ text: "Back", callback_data: backId || "start" }]);
  }

  return { reply_markup: { inline_keyboard: inlineKeyboard } };
};

const startMenu = {
  reply_markup: {
    inline_keyboard: [
      ...Object.values(menu).map((pack) => {
        return [{ text: pack.name, callback_data: pack.id }];
      }),
    ],
  },
};

const sendStartMenu = async (ctx) => {
  const selections = userSelections.get(ctx.from.id) || {};
  const text = addOrderSummary(
    selections,
    "Welcome to MorphyOrderBot! Please select which sticker pack you would like!",
  );
  await ctx.reply("Loading sticker packs...")
  await ctx.sendMediaGroup([
    {
      type: "photo",
      media: "https://order-bot-ruby.vercel.app/images/eeveelutions/eeveelutions.JPG",
    },
    {
      type: "photo",
      media: "https://order-bot-ruby.vercel.app/images/eeveelutions/about_the_journey.JPG",
    },
    {
      type: "photo",
      media: "https://order-bot-ruby.vercel.app/images/eeveelutions/life_is_tough.JPG",
    },
  ]);
  await ctx.reply(text, startMenu);
};

bot.action("start", async (ctx) => {
  await ctx.answerCbQuery();
  const selections = userSelections.get(ctx.from.id) || {};
  const text = addOrderSummary(
    selections,
    "Welcome to MorphyOrderBot! Please select which sticker pack you would like!",
  );
  return ctx.editMessageText(text, startMenu);
});

const sendEeveelutionsMenu = async (ctx) => {
  const selections = userSelections.get(ctx.from.id) || {};
  const text = addOrderSummary(
    selections,
    "Which Eeveelution sticker would you like?",
  );
  return await ctx.editMessageText(
    text,
    getMenu(
      ctx.from.id,
      3,
      3,
      menu.eeveelutions.options,
      menu.eeveelutions.id,
      "start",
    ),
  );
};

const sendAboutTheJourneyMenu = async (ctx) => {
  const selections = userSelections.get(ctx.from.id) || {};
  const text = addOrderSummary(
    selections,
    "Don't forget to enjoy the journey! Which 'About the Journey' sticker would you like?",
  );
  return await ctx.editMessageText(
    text,
    getMenu(
      ctx.from.id,
      5,
      1,
      menu.aboutTheJourney.options,
      menu.aboutTheJourney.id,
      "start",
    ),
  );
};

const sendLifeIsToughMenu = async (ctx) => {
  const selections = userSelections.get(ctx.from.id) || {};
  const text = addOrderSummary(
    selections,
    "Life can be tough, but these stickers will help you express yourself! Which 'Life is Tough' sticker would you like?",
  );
  return await ctx.editMessageText(
    text,
    getMenu(
      ctx.from.id,
      2,
      3,
      menu.lifeIsTough.options,
      menu.lifeIsTough.id,
      "start",
    ),
  );
};

bot.action(menu.eeveelutions.id, async (ctx) => {
  await ctx.answerCbQuery();
  return await sendEeveelutionsMenu(ctx);
});

bot.action(menu.aboutTheJourney.id, async (ctx) => {
  await ctx.answerCbQuery();
  return await sendAboutTheJourneyMenu(ctx);
});

bot.action(menu.lifeIsTough.id, async (ctx) => {
  await ctx.answerCbQuery();
  return await sendLifeIsToughMenu(ctx);
});

bot.action(/^select_([^|]+)\|(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const itemKey = ctx.match[1];
  const packKey = ctx.match[2];
  const pack = menuById[packKey];
  const option = pack
    ? pack.options.find((option) => option.id === itemKey)
    : null;
  const item = option ? option.name : itemKey;

  pendingSelections.set(ctx.from.id, { item, pack: packKey });

  const selections = userSelections.get(ctx.from.id) || {};
  const text = addOrderSummary(
    selections,
    `How many ${item} stickers would you like?`,
  );

  return await ctx.editMessageText(text, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "0", callback_data: "qty_0" },
          { text: "1", callback_data: "qty_1" },
          { text: "2", callback_data: "qty_2" },
          { text: "3", callback_data: "qty_3" },
        ],
        [
          { text: "4", callback_data: "qty_4" },
          { text: "5", callback_data: "qty_5" },
          { text: "6", callback_data: "qty_6" },
          { text: "7", callback_data: "qty_7" },
        ],
        [
          { text: "8", callback_data: "qty_8" },
          { text: "9", callback_data: "qty_9" },
          { text: "10", callback_data: "qty_10" },
          { text: "11", callback_data: "qty_11" },
        ],
        [
          { text: "12", callback_data: "qty_12" },
          { text: "13", callback_data: "qty_13" },
          { text: "14", callback_data: "qty_14" },
          { text: "15", callback_data: "qty_15" },
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
  const selections = userSelections.get(ctx.from.id) || {};
  if (!selection || !selection.item) {
    return await ctx.reply("Please select a sticker first.");
  }

  if (qty === 0) {
    userSelections.get(ctx.from.id)?.[selection.item] &&
      delete userSelections.get(ctx.from.id)[selection.item];
    pendingSelections.delete(ctx.from.id);
  } else {
    const item = selection.item;
    selections[item] = qty;
    userSelections.set(ctx.from.id, selections);
    pendingSelections.delete(ctx.from.id);
  }

  const summary = Object.entries(selections)
    .map(([eevee, qty]) => `- ${eevee}: ${qty} stickers`)
    .join("\n");

  await ctx.editMessageText(
    `Order Summary:\n${summary}\n\nThank you! Returning to your sticker pack menu...`,
  );

  const packKey = selection.pack;
  if (packKey === menu.eeveelutions.id) return await sendEeveelutionsMenu(ctx);
  if (packKey === menu.aboutTheJourney.id)
    return await sendAboutTheJourneyMenu(ctx);
  if (packKey === menu.lifeIsTough.id) return await sendLifeIsToughMenu(ctx);
  return await sendStartMenu(ctx);
});

bot.command("clearorder", async (ctx) => {
  userSelections.delete(ctx.from.id);
  pendingSelections.delete(ctx.from.id);
  return await ctx.reply("Your order has been cleared.");
});

bot.start(sendStartMenu);
// bot.launch(); // Removed for Vercel serverless compatibility - using webhooks instead

module.exports = bot;
