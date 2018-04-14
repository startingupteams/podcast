const { Prisma } = require('prisma-binding')
const Telegraf = require('telegraf')

const db = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: 'http://localhost:4466/hello_prisma/dev', // the endpoint of the Prisma DB service
  secret: 'mysecret123', // specified in database/prisma.yml
  debug: true, // log all GraphQL queryies & mutations
})

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => {
  ctx.reply('Welcome')
  const user = ctx.update.message.from
  db.mutation.createUser({
    data: {
      telegramID: user.id,
      username: user.username,
      firstname: user.first_name,
      languagecode: user.language_code
    }
  })
})

bot.command('ali',(ctx)=>{
  ctx.reply(ctx.update.message.from)
})
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('??'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.hears(/buy/i, (ctx) => ctx.reply('Buy-buy'))

module.exports = bot
