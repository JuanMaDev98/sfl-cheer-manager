import { Bot, Context } from 'grammy';

// Bot configuration
const BOT_TOKEN = process.env.BOT_TOKEN;
const MINIAPP_URL = process.env.MINIAPP_URL || 'https://sfl-cheer-manager.juanmgv98.workers.dev';

if (!BOT_TOKEN) {
  console.error('BOT_TOKEN environment variable is required');
  process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

// /start - Opens the MiniApp
bot.command('start', async (ctx: Context) => {
  // Check if this is a deep link (e.g., /start post_123)
  const rawArgs = ctx.match.value;
  
  if (rawArgs && rawArgs.startsWith('post_')) {
    // Deep link to a specific post
    const postId = rawArgs.replace('post_', '');
    await ctx.reply(`🌻 Opening post...`, {
      reply_markup: {
        web_app: {
          url: `${MINIAPP_URL}?post=${postId}`
        }
      }
    });
  } else {
    // Regular /start - open main MiniApp
    await ctx.reply('🌻 Welcome to SFL Cheer Manager!\n\nFind help or cheer with other Sunflower Land players.', {
      reply_markup: {
        web_app: {
          url: MINIAPP_URL
        }
      }
    });
  }
});

// /help - Show help message
bot.command('help', async (ctx: Context) => {
  await ctx.reply(
    '🌻 *SFL Cheer Manager*\n\n' +
    '/start - Open the app\n' +
    '/help - Show this message\n\n' +
    'Use the button below to open the MiniApp and start posting!',
    { parse_mode: 'Markdown' }
  );
});

// /new - Create a new post (opens miniapp in create mode)
bot.command('new', async (ctx: Context) => {
  await ctx.reply('🌻 Create a new post!', {
    reply_markup: {
      web_app: {
        url: `${MINIAPP_URL}?action=create`
      }
    }
  });
});

// Handle all other messages with a button to open MiniApp
bot.on('message', async (ctx: Context) => {
  await ctx.reply('🌻 Open the SFL Cheer Manager to get started!', {
    reply_markup: {
      web_app: {
        url: MINIAPP_URL
      }
    }
  });
});

// Handle callback queries from inline buttons
bot.on('callback_query', async (ctx: Context) => {
  const data = ctx.callbackQuery.data;
  
  if (data?.startsWith('open_post_')) {
    const postId = data.replace('open_post_', '');
    await ctx.answerCallbackQuery({
      web_app: {
        url: `${MINIAPP_URL}?post=${postId}`
      }
    });
  } else {
    await ctx.answerCallbackQuery();
  }
});

// Start the bot
console.log('🤖 SFL Cheer Manager Bot starting...');
console.log(`📱 MiniApp URL: ${MINIAPP_URL}`);
bot.start();
console.log('✅ Bot is running!');
