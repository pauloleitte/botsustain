const env = require('../.env')
const Telegraf = require('telegraf')
const Telegram = require('telegraf/telegram')
const axios = require('axios')
const moment = require('moment')
const schedule = require('node-schedule');
const bot = new Telegraf(env.token)
const telegram = new Telegram(env.token)

var listaChamadosdeAuto = []
var listaChamadosdeMassificados = []
var listaChamadosFechadosDiario = []
var listaChamadosFechadosMensal = []


var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, 1, 2, 3, 4];
rule.hour = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
rule.minute = [0, 15, 30, 45, 59];

var j = schedule.scheduleJob(rule, async () => {
    await enviarChamadosAuto();
    await enviarChamadosMassificados();
});


const enviarChamadosAuto = async () => {
    await getChamadosAuto()
    const now = moment().format("DD/MM/YYYY")
    var contador = 0;
    listaChamadosdeAuto.map(chamado => {
        if (chamado.DataNextBreachOLA != null) {
            if (chamado.DataNextBreachOLA.substring(0, 10) == now) {
                contador = contador + 1;
            }
        }
    })
    if (contador != 0) {
        await telegram.sendMessage(env.groupAutoId, `Temos ${contador} para vencer na data de ${now}`)
    }
}

const enviarChamadosMassificados = async () => {
    await getChamadosMassificados()
    const now = moment().format("DD/MM/YYYY")
    var contador = 0;
    listaChamadosdeMassificados.map(chamado => {
        if (chamado.DataNextBreachOLA != null) {
            if (chamado.DataNextBreachOLA.substring(0, 10) == now) {
                contador = contador + 1;
            }
        }
    })
    if (contador != 0) {
        await telegram.sendMessage(env.groupMassificadoId, `Temos ${contador} para vencer na data de ${now}`)
    }

}


const getChamadosFechadosDiario = async () => {
    await axios.get(env.apiChamados + "2").then(resp => {
        listaChamadosFechadosDiario = resp.data.Table
    }).catch(e => console.log(e))
}

const getChamadosFechadosMensal = async () => {
    await axios.get(env.apiChamados + "5").then(resp => {
        listaChamadosFechadosMensal = resp.data.Table
    }).catch(e => console.log(e))
}

const getChamadosAuto = async () => {
    await axios.get(env.apiChamados + "6").then(resp => {
        listaChamadosdeAuto = resp.data.Table
    }).catch(e => console.log(e))
}

const getChamadosMassificados = async () => {
    await axios.get(env.apiChamados + "7").then(resp => {
        listaChamadosdeMassificados = resp.data.Table
    }).catch(e => console.log(e))
}

const main = async () => {
    await getChamadosAuto();
    await getChamadosMassificados();
    await getChamadosFechadosMensal();
    await getChamadosFechadosDiario();
}

bot.start(async ctx => {
    const nome = ctx.update.message.from.first_name
    await ctx.replyWithMarkdown(`*Olá, ${nome}!*\nEu sou o Bot Sustain`)
})

bot.command("dashboard", ctx => {
    const now = moment().format("DD/MM/YYYY")
    console.log(now)
})

bot.command("fdiario", async ctx => {
    await listaChamadosFechadosDiario.map(user => {
        ctx.reply(`
            Usuário: ${user.NomeProfissional}
        Fechados: ${user.ChamadosFechados}
        `)
    })
})

bot.command("fmensal", async ctx => {
    await listaChamadosFechadosMensal.map(user => {
        ctx.reply(
            `Usuário: ${user.NomeProfissional}
        Fechados: ${user.ChamadosFechados}
        `)
    })
})

main();

bot.startPolling()