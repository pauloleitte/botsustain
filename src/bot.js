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
var listaChamadosAuto = []
var listaChamadosCargas = []
var listaChamadosWebMethods = []
var listaChamadosMassificados = []
var listaChamadosFechadosDiario = []
var listaChamadosFechadosMensal = []


//Criando a regra de schedule.
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [1, 2, 3, 4, 5];
rule.hour = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
rule.minute = [5, 15, 25, 35, 45, 55];

//Iniciando o Job schedule.
var j = schedule.scheduleJob(rule, async () => {
    await enviarChamadosAuto();
    await enviarChamadosMassificados();
    await enviarChamadosCargas();
    await enviarChamadosWebMethods();
});

//Método que realiza o envio dos chamados para o grupo de auto via telegram.
const enviarChamadosAuto = async () => {
    await getChamadosAuto()
    const now = moment().format("DD/MM/YYYY")
    var contador = 0;
    listaChamadosAuto.map(chamado => {
        if (chamado.DataNextBreachOLA != null) {
            if (moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY") == now) {
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
    listaChamadosMassificados.map(chamado => {
        if (chamado.DataNextBreachOLA != null) {
            if (moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY") == now) {
                contador = contador + 1;
            }
        }
    })
    if (contador != 0) {
        await telegram.sendMessage(env.groupMassificadoId, `Temos ${contador} para vencer na data de ${now}`)
    }

}
//Método que realiza o envio dos chamados para o grupo de cargas via telegram.
const enviarChamadosCargas = async () => {
    await getChamadosCargas()
    const now = moment().format("DD/MM/YYYY")
    var contador = 0;
    listaChamadosCargas.map(chamado => {
        if (chamado.DataNextBreachOLA != null) {
            if (moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY") == now) {
                contador = contador + 1;
            }
        }
    })
    if (contador != 0) {
        await telegram.sendMessage(env.groupAutoId, `Temos ${contador} para vencer na data de ${now}`)
    }

}

//Método que realiza o envio dos chamados para o grupo de webmethods via telegram.
const enviarChamadosWebMethods = async () => {
    await getChamadosWebMethods()
    const now = moment().format("DD/MM/YYYY")
    var contador = 0;
    listaChamadosWebMethods.map(chamado => {
        if (chamado.DataNextBreachOLA != null) {
            if (moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY") == now) {
                contador = contador + 1;
            }
        }
    })
    if (contador != 0) {
        await telegram.sendMessage(env.groupAutoId, `Temos ${contador} para vencer na data de ${now}`)
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
    await axios.get(env.apiChamados + "2").then(resp => {
        listaChamadosAuto = resp.data
    }).catch(e => console.log(e))
}

//Realiza a chamada na API para recolher a lista de chamado de Massificados.
const getChamadosMassificados = async () => {
    await axios.get(env.apiChamados + "3").then(resp => {
        listaChamadosMassificados = resp.data
    }).catch(e => console.log(e))
}

const getChamadosCargas = async () => {
    await axios.get(env.apiChamados + "4").then(resp => {
        listaChamadosCargas = resp.data
    }).catch(e => console.log(e))
}

const getChamadosWebMethods = async () => {
    await axios.get(env.apiChamados + "5").then(resp => {
        listaChamadosWebMethods = resp.data
    }).catch(e => console.log(e))
}

//Inicializa as listas.
const main = async () => {
    await getChamadosAuto();
    await getChamadosMassificados();
    await getChamadosCargas();
    await getChamadosWebMethods();
    //await getChamadosFechadosMensal();
    //await getChamadosFechadosDiario();
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
    listaChamadosAuto.map(chamado => {
        if (chamado.DataNextBreachOLA != null) {
            if (moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY") == now) {
                existeChamado = true;
            }
        }
    })
    if (existeChamado) {
        await listaChamadosAuto.map(chamado => {
            if (chamado.DataNextBreachOLA != null) {
                if (moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY") == now) {
                    var vencimento = moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY HH:mm:ss")
                    ctx.reply(`Incidente: ${chamado.IdIncidente} 
Titulo: ${chamado.Titulo} 
Prioridade: ${chamado.Prioridade} 
Vencimento: ${vencimento}
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
    listaChamadosMassificados.map(chamado => {
        if (chamado.DataNextBreachOLA != null) {
            if (moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY") == now) {
                existeChamado = true
            }
        }
    })
    if (existeChamado) {
        await listaChamadosMassificados.map(chamado => {
            if (chamado.DataNextBreachOLA != null) {
                if (moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY") == now) {
                    var vencimento = moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY HH:mm:ss")
                    ctx.reply(`Incidente: ${chamado.IdIncidente}
Titulo: ${chamado.Titulo}
Prioridade: ${chamado.Prioridade}
Vencimento: ${vencimento}
Status: ${chamado.Status}`)
                }
            }
        })
    }
    else {
        ctx.reply(`Não há chamados de Massificados para ${now}.`)
    }
})

//Retorna a lista de chamados de Cargas através do comando.
bot.command("dcargas", async ctx => {
    await getChamadosCargas()
    const now = moment().format("DD/MM/YYYY")
    var existeChamado = false;
    listaChamadosCargas.map(chamado => {
        if (chamado.DataNextBreachOLA != null) {
            if (moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY") == now) {
                existeChamado = true
            }
        }
    })
    if (existeChamado) {
        await listaChamadosCargas.map(chamado => {
            if (chamado.DataNextBreachOLA != null) {
                if (moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY") == now) {
                    var vencimento = moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY HH:mm:ss")
                    ctx.reply(`Incidente: ${chamado.IdIncidente}
Titulo: ${chamado.Titulo}
Prioridade: ${chamado.Prioridade}
Vencimento: ${vencimento}
Status: ${chamado.Status}`)
                }
            }
        })
    }
    else {
        ctx.reply(`Não há chamados de Cargas para ${now}.`)
    }
})

//Retorna a lista de chamados de WebMethods através do comando.
bot.command("dwebmethods", async ctx => {
    await getChamadosWebMethods()
    const now = moment().format("DD/MM/YYYY")
    var existeChamado = false;
    listaChamadosWebMethods.map(chamado => {
        if (chamado.DataNextBreachOLA != null) {
            if (moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY") == now) {
                existeChamado = true
            }
        }
    })
    if (existeChamado) {
        await listaChamadosWebMethods.map(chamado => {
            if (chamado.DataNextBreachOLA != null) {
                if (moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY") == now) {
                    var vencimento = moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY HH:mm:ss")
                    ctx.reply(`Incidente: ${chamado.IdIncidente}
Titulo: ${chamado.Titulo}
Prioridade: ${chamado.Prioridade}
Vencimento: ${vencimento}
Status: ${chamado.Status}`)
                }
            }
        })
    }
    else {
        ctx.reply(`Não há chamados de Webmethods para ${now}.`)
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