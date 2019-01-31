const env = require('../.env')
const Telegraf = require('telegraf')
const axios = require('axios')
const bot = new Telegraf(env.token)

var listaChamadosdeAuto = []
var listaChamadosdeMassificados = []
var listaChamadosFechadosDiario = []
var listaChamadosFechadosMensal = []


const getChamadosAuto = async () => {
    await axios.get(env.apiChamados + "6").then(resp =>{
        listaChamadosdeAuto = resp.data.Table
        console.log(listaChamadosdeAuto)
    }).catch(e => console.log(e))
}

const getChamadosMassificados = async () => {
    await axios.get(env.apiChamados + "7").then(resp =>{
        listaChamadosdeMassificados = resp.data.Table
        console.log(listaChamadosdeMassificados)
    }).catch(e => console.log(e))
}


bot.start(async ctx => {
    const nome = ctx.update.message.from.first_name
    await ctx.replyWithMarkdown(`*Olá, ${nome}!*\nEu sou o Bot Sustain`)
})

bot.command("dashboard", ctx =>{
    getChamadosAuto();
    getChamadosMassificados();
})

bot.startPolling()