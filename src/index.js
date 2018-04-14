const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const bot = require("./bot")

bot.startPolling()
