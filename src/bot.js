const {Prisma} = require('prisma-binding')
const Telegraf = require('telegraf')
const search = require('./search')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')


const db = new Prisma({
    typeDefs: 'src/generated/prisma.graphql',
    endpoint: 'http://localhost:4466/hello_prisma/dev', // the endpoint of the Prisma DB service
    secret: 'mysecret123', // specified in database/prisma.yml
    debug: true, // log all GraphQL queryies & mutations
})

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.telegram.getMe().then((botInfo) => {
    bot.options.username = botInfo.username
})

// bot.use(Telegraf.log())

bot.start((ctx) => {
    const user = ctx.update.message.from
    ctx.replyWithHTML(`Welcome to Podcast bot, <i>${user.first_name}</i>`)

    ctx.reply('main menu 👇', Markup
        .keyboard([
            ['Search in podcasts 🔍'],
            ['Subscriptions 🔗'],
            ['about POD 📋']
        ])
        .oneTime()
        .resize()
        .extra()
    )


    db.mutation.createUser({
        data: {
            telegramID: user.id,
            username: user.username,
            firstname: user.first_name,
            languagecode: user.language_code
        }
    })
})


bot.hears('Search in podcasts 🔍', (ctx) => {
    ctx.reply('Please enter a text to search:')
    bot.on('text', (ctx) => {
        search(ctx.message.text).then(
            (results) => {
                if (results.length == 0) {
                    ctx.replyWithHTML(`No podcast with the text <code>${ctx.message.text}</code> found.`)
                } else {
                    results.forEach(result =>
                        ctx.replyWithPhoto(
                            result.artworkUrl,
                            Extra.load({
                                caption: createCaption(result)
                            })
                            .HTML()
                            .markup(Markup.inlineKeyboard([
                                Markup.callbackButton("Subscribe", `Subscribe ${result.collectionId}`)
                            ]))
                        )
                    )
                }
            }
        )
    })
})


bot.hears('about POD 📋', (ctx) =>
    ctx.reply('abouuut poddd ....')
)

bot.hears('Subscriptions 🔗', (ctx) =>
    ctx.reply('list of my Subscriptions')
)


const createCaption = result =>
    `<a href="${result.collectionViewUrl}">${result.collectionName}</a> (${result.trackCount} Eposods)
<b>By</b>: ${result.artistName}
<b>Genres</b>: ${result.primaryGenreName}
<b>Last release</b>: ${new Date(result.releaseDate).toLocaleDateString()}
`


bot.action(/^Subscribe (.*)/, ({
    from: {
        id
    },
    reply,
    match
}) => {
    const podcastId = match[1]

    db.query.users({
        where: {
            telegramID: id
        }
    }, "{ id }").then(([{
        id
    }]) => {
        db.mutation.updateUser({
            where: {
                id
            },
            data: {
                podcasts: {
                    upsert: {
                        where: {
                            podcastId
                        },
                        create: {
                            podcastId
                        },
                        update: {}
                    }
                }
            }
        }).then(r => reply(r))
    })
})

bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('??'))


module.exports = bot
