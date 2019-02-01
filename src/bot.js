//  Relizando os imports do node_modules.
const env = require('../.env')
const Telegraf = require('telegraf')
const Telegram = require('telegraf/telegram')
const axios = require('axios')
const moment = require('moment')
const schedule = require('node-schedule');

// Criando os objetos.
const bot = new Telegraf(env.token)
const telegram = new Telegram(env.token)

//Declarando as váriaveis.
var listaChamadosdeAuto = []
var listaChamadosdeMassificados = []
var listaChamadosFechadosDiario = []
var listaChamadosFechadosMensal = []

//Criando a regra de schedule.
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [ 1, 2, 3, 4, 5];
rule.hour = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
rule.minute = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

//Iniciando o Job schedule.
var j = schedule.scheduleJob(rule, async () => {
    await enviarChamadosAuto();
    await enviarChamadosMassificados();
});

//Método que realiza o envio dos chamados para o grupo de auto via telegram.
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

//Método que realiza o envio dos chamados para o grupo de massificados via telegram.
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

//Realiza a chamada na API para recolher os dados de Chamados Fechados Diario.
const getChamadosFechadosDiario = async () => {
    await axios.get(env.apiChamados + "2").then(resp => {
        listaChamadosFechadosDiario = resp.data.Table
    }).catch(e => console.log(e))
}

//Realiza a chamada na API para recolher os dados de Chamados Fechados Mensal.
const getChamadosFechadosMensal = async () => {
    await axios.get(env.apiChamados + "5").then(resp => {
        listaChamadosFechadosMensal = resp.data.Table
    }).catch(e => console.log(e))
}

//Realiza a chamada na API para recolher a lista de chamados de Auto.
const getChamadosAuto = async () => {
    await axios.get(env.apiChamados + "6").then(resp => {
        listaChamadosdeAuto = resp.data.Table
    }).catch(e => console.log(e))
}

//Realiza a chamada na API para recolher a lista de chamado de Massificados.
const getChamadosMassificados = async () => {
    await axios.get(env.apiChamados + "7").then(resp => {
        listaChamadosdeMassificados = resp.data.Table
    }).catch(e => console.log(e))
}

//Inicializa as listas.
const main = async () => {
    await getChamadosAuto();
    await getChamadosMassificados();
    await getChamadosFechadosMensal();
    await getChamadosFechadosDiario();
}

//Comando de start do bot.
bot.start(async ctx => {
    const nome = ctx.update.message.from.first_name
    await ctx.replyWithMarkdown(`*Olá, ${nome}!*\nEu sou o Bot Sustain`)
})

//Retorna a lista de chamados de Auto através do comando.
bot.command("dauto", async ctx => {
    await getChamadosAuto()
    const now = moment().format("DD/MM/YYYY")
    var existeChamado = false;
    listaChamadosdeAuto.map(chamado => {
        if (chamado.DataNextBreachOLA != null) {
            if (chamado.DataNextBreachOLA.substring(0, 10) == now) {
                existeChamado = true;
            }
        }
    })
    if (existeChamado) {
        await listaChamadosdeAuto.map(chamado => {
            if (chamado.DataNextBreachOLA != null) {
                if (chamado.DataNextBreachOLA.substring(0, 10) == now) {
                    ctx.reply(`Incidente: ${chamado.IdIncidente} 
Titulo: ${chamado.Titulo} 
Prioridade: ${chamado.Prioridade} 
Vencimento: ${chamado.DataNextBreachOLA}
Status: ${chamado.Status}`)
                }
            }
        })
    }
    else {
        ctx.reply(`Não há chamados de Auto para ${now}.`)
    }
})

//Retorna a lista de chamados de Massificados através do comando.
bot.command("dmassificado", async ctx => {
    await getChamadosMassificados()
    const now = moment().format("DD/MM/YYYY")
    var existeChamado = false;
    listaChamadosdeMassificados.map(chamado => {
        if (chamado.DataNextBreachOLA != null) {
            if (chamado.DataNextBreachOLA.substring(0, 10) == now) {
                existeChamado = true
            }
        }
    })
    if (existeChamado) {
        await listaChamadosdeMassificados.map(chamado => {
            if (chamado.DataNextBreachOLA != null) {
                if (chamado.DataNextBreachOLA.substring(0, 10) == now) {
                    ctx.reply(`Incidente: ${chamado.IdIncidente}
Titulo: ${chamado.Titulo}
Prioridade: ${chamado.Prioridade}
Vencimento: ${chamado.DataNextBreachOLA}
Status: ${chamado.Status}`)
                }
            }
        })
    }
    else {
        ctx.reply(`Não há chamados de Massificados para ${now}.`)
    }
})

//Retorna por usuário a lista de chamado fechados diario.
bot.command("fdiario", async ctx => {
    await getChamadosFechadosDiario()
    await listaChamadosFechadosDiario.map(user => {
        ctx.reply(`Usuário: ${user.NomeProfissional}
Fechados: ${user.ChamadosFechados}`)
    })
})

//Retorna por usuário a lista de chamado fechados mensal.
bot.command("fmensal", async ctx => {
    await getChamadosFechadosMensal()
    await listaChamadosFechadosMensal.map(user => {
        ctx.reply(
            `Usuário: ${user.NomeProfissional}
Fechados: ${user.ChamadosFechados}`)
    })
})

//Chamada do main.
main();

//Start o recebimento de mensagens.
bot.startPolling()