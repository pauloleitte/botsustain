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
var listaChamadosGeral = []

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
        await telegram.sendMessage(env.groupCargasId, `Temos ${contador} para vencer na data de ${now}`)
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
        await telegram.sendMessage(env.groupAutoId, `Temos ${contador} na fila do WebMethods para vencer na data de ${now}`)
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

//Realiza a chamada na API para recolher a lista de chamado de Carga.
const getChamadosCargas = async () => {
    await axios.get(env.apiChamados + "4").then(resp => {
        listaChamadosCargas = resp.data
    }).catch(e => console.log(e))
}

//Realiza a chamada na API para recolher a lista de chamado de WebMethods.
const getChamadosWebMethods = async () => {
    await axios.get(env.apiChamados + "5").then(resp => {
        listaChamadosWebMethods = resp.data
    }).catch(e => console.log(e))
}

//Realiza a chamada na API para recolher a lista de chamados Geral.
const getChamadosGeral = async () => {
    await axios.get(`${env.apiChamados}1`).then(resp => {
        listaChamadosGeral = resp.data
    }).catch(e => console.log(e))
}

//Inicializa as listas.
const main = async () => {
    await
        //Start o recebimento de mensagens.
        bot.startPolling()
    //await getChamadosGeral();
    await getChamadosAuto();
    await getChamadosMassificados();
    await getChamadosCargas();
    await getChamadosWebMethods();
    await getChamadosGeral();
    //await getChamadosFechadosMensal();
    //await getChamadosFechadosDiario();
    console.log("Bot iniciado com sucesso")
}

//Comando de start do bot.
bot.start(async ctx => {
    const nome = ctx.update.message.from.first_name
    await ctx.replyWithMarkdown(`*Olá, ${nome}!*\nEu sou o Bot Sustain`)
    await ctx.replyWithMarkdown(`Comando disponíveis para uso:
/dauto - *Lista de chamados de auto para vencer na data atual.*
/dmassificado - *Lista de chamados de massificados para vencer na data atual.*
/dcarga - *Lista de chamados de cargas para vencer na data atual.*
/dwebmethods - *Lista de chamados de webMethods para vencer na data atual.*
/frota - *Lista de chamados de frota.*
/novoendosso - *Lista de chamados de novo endosso.*
/renovacao - *Lista de chamados de renovação.*
 /bb - *Lista de chamados do BB.*
 /novoportal - *Lista de chamados do novo mcc.*
 /aauto - *Número de chamados de auto a vencer na data d+1.*
 /amasssificado - *Número de chamados de massificados a vencer na data d+1.*
 /chamadosantigo - *Lista de chamados com mais de 20 dias de abertura.*`)
})

//Retorna a lista de chamados de Auto através do comando.
bot.hears(/dauto/i, async ctx => {
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
                    ctx.replyWithMarkdown(`Incidente: *${chamado.IdIncidente}*
Titulo: *${chamado.Titulo}*
Prioridade: *${chamado.Prioridade}*
Vencimento: *${vencimento}*
Status: *${chamado.Status}*`)
                }
            }
        })
    }
    else {
        ctx.reply(`Não há chamados de Auto para ${now}.`)
    }
})

//Retorna a lista de chamados de Massificados através do comando.
bot.hears(/dmassificado/i, async ctx => {
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
                    ctx.replyWithMarkdown(`Incidente: *${chamado.IdIncidente}*
Titulo: *${chamado.Titulo}*
Prioridade: *${chamado.Prioridade}*
Vencimento: *${vencimento}*
Status: *${chamado.Status}*`)
                }
            }
        })
    }
    else {
        ctx.reply(`Não há chamados de Massificados para ${now}.`)
    }
})

//Retorna a lista de chamados de Cargas através do comando.
bot.hears(/dcargas/i, async ctx => {
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
                    ctx.replyWithMarkdown(`Incidente: *${chamado.IdIncidente}*
Titulo: *${chamado.Titulo}*
Prioridade: *${chamado.Prioridade}*
Vencimento: *${vencimento}*
Status: *${chamado.Status}*`)
                }
            }
        })
    }
    else {
        ctx.reply(`Não há chamados de Cargas para ${now}.`)
    }
})

//Retorna a lista de chamados de WebMethods através do comando.
bot.hears(/dwebmethods/i, async ctx => {
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
                    ctx.replyWithMarkdown(`Incidente: *${chamado.IdIncidente}*
Titulo: *${chamado.Titulo}*
Prioridade: *${chamado.Prioridade}*
Vencimento: *${vencimento}*
Status: *${chamado.Status}*`)
                }
            }
        })
    }
    else {
        ctx.reply(`Não há chamados de Webmethods para ${now}.`)
    }
})

// //Retorna por usuário a lista de chamado fechados diario.
// bot.command("fdiario", async ctx => {
//     await getChamadosFechadosDiario()
//     await listaChamadosFechadosDiario.map(user => {
//         ctx.reply(`Usuário: ${user.NomeProfissional}
// Fechados: ${user.ChamadosFechados}`)
//     })
// })

// //Retorna por usuário a lista de chamado fechados mensal.
// bot.command("fmensal", async ctx => {
//     await getChamadosFechadosMensal()
//     await listaChamadosFechadosMensal.map(user => {
//         ctx.reply(
//             `Usuário: ${user.NomeProfissional}
// Fechados: ${user.ChamadosFechados}`)
//     })
// })

//Retorna a lista de chamados do Frota.
bot.hears(/frota/i, async ctx => {
    listaChamadosAuto.map(chamado => {
        if (chamado.Titulo.includes("FR") || chamado.Titulo.includes("EFR")) {
            var vencimento = moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY HH:mm:ss")
            ctx.replyWithMarkdown(`Incidente: *${chamado.IdIncidente}*
Titulo: *${chamado.Titulo}*
Prioridade: *${chamado.Prioridade}*
Vencimento: *${vencimento}*
Status: *${chamado.Status}*`)
        }
    })
})

//Retorna a lista de chamados do Novo Endosso.
bot.hears(/novoendosso/i, async ctx => {
    listaChamadosAuto.map(chamado => {
        if (chamado.Titulo.includes("NEA")) {
            var vencimento = moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY HH:mm:ss")
            ctx.replyWithMarkdown(`Incidente: *${chamado.IdIncidente}*
Titulo: *${chamado.Titulo}*
Prioridade: *${chamado.Prioridade}*
Vencimento: *${vencimento}*
Status: *${chamado.Status}*`)
        }
    })
})

//Retorna a lista de Chamados de Renovação.
bot.hears(/renovacao/i, async ctx => {
    listaChamadosAuto.map(chamado => {
        if (chamado.Titulo.includes("RM")) {
            var vencimento = moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY HH:mm:ss")
            ctx.replyWithMarkdown(`Incidente: *${chamado.IdIncidente}*
Titulo: *${chamado.Titulo}*
Prioridade: *${chamado.Prioridade}*
Vencimento: *${vencimento}*
Status: *${chamado.Status}*`)
        }
    })
})

//Retorna a lista de chamados do BB.
bot.hears(/bb/i, async ctx => {
    listaChamadosAuto.map(chamado => {
        if (chamado.Titulo.includes("BB")) {
            var vencimento = moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY HH:mm:ss")
            ctx.replyWithMarkdown(`Incidente: *${chamado.IdIncidente}*
Titulo: *${chamado.Titulo}*
Prioridade: *${chamado.Prioridade}*
Vencimento: *${vencimento}*
Status: *${chamado.Status}*`)
        }
    })
})

bot.hears(/novoportal/i, async ctx => {
    listaChamadosAuto.map(chamado => {
        if (chamado.Titulo.includes("NMCC")) {
            var vencimento = moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY HH:mm:ss")
            ctx.replyWithMarkdown(`Incidente: *${chamado.IdIncidente}*
Titulo: *${chamado.Titulo}*
Prioridade: *${chamado.Prioridade}*
Vencimento: *${vencimento}*
Status: *${chamado.Status}*`)
        }
    })
})

bot.hears(/aauto/i, async ctx => {
    await getChamadosAuto()
    const now = moment().add(1, 'days').format("DD/MM/YYYY")
    var contador = 0;
    listaChamadosAuto.map(chamado => {
        if (chamado.DataNextBreachOLA != null) {
            if (moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY") == now) {
                contador = contador + 1;
            }
        }
    })
    if (contador != 0) {
        await ctx.replyWithMarkdown(`Temos *${contador}* chamado(s) de auto para vencer na data de *${now}*`)
    }
    else {
        await ctx.replyWithMarkdown(`Não temos chamados para vencer na data de *${now}*`)
    }
})

bot.hears(/amassificado/i, async ctx => {
    await getChamadosMassificados()
    const now = moment().add(1, 'days').format("DD/MM/YYYY")
    var contador = 0;
    listaChamadosMassificados.map(chamado => {
        if (chamado.DataNextBreachOLA != null) {
            if (moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY") == now) {
                contador = contador + 1;
            }
        }
    })
    if (contador != 0) {
        await ctx.replyWithMarkdown(`Temos *${contador}* chamado(s) de massificados para vencer na data de *${now}*`)
    }
    else {
        await ctx.replyWithMarkdown(`Não temos chamados para vencer na data de *${now}*`)
    }
})

bot.hears(/chamadosantigo/i, async ctx => {
    const dia = moment().subtract(20, 'days').calendar()
    listaChamadosGeral.map(chamado => {
        if (dia >= moment(chamado.DataAbertura).format("MM/DD/YYYY")) {
            var vencimento = moment(chamado.DataNextBreachOLA).format("DD/MM/YYYY HH:mm:ss")
            var dataabertura = moment(chamado.DataAbertura).format("DD/MM/YYYY HH:mm:ss")
            var dataAbertura = new Date(chamado.DataAbertura)
            var idade = (new Date() - dataAbertura) / 24 / 60 / 60 / 1000
            idade = parseFloat(idade).toFixed(0);
            ctx.replyWithMarkdown(`Incidente: *${chamado.IdIncidente}* 
Titulo: *${chamado.Titulo}* 
Prioridade: *${chamado.Prioridade}* 
Vencimento: *${vencimento}*
Status: *${chamado.Status}*
DataAbertura: *${dataabertura}*
NomeGrupo: *${chamado.NomeGrupo}*
Idade: *${idade} dias*`)
        }
    })
})

//Chamada do main.
main();

