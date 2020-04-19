const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const fs = require('fs')
const idCorrecao = [{ idCorrecao: '', ordem: '9999' }]
const codigoErro = { codErro: '' }
const idsArray = []
var textoCorrecao
var textoCorrigido = {}
var textoComDefeito = {}
var correcaoReservada = {}

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const router = express.Router()

router.get('/', (request, response) => response.json({ messagem: 'Web API funcionando!' }))

const extrairInformacao = (origem) => {

    //Se for um array realiza a extração de seus itens//
    if (Array.isArray(origem)) {
      return origem.reduce((acumulador, item) => [...acumulador, ...extrairInformacao(item)], []);
    }
  
    //Se for um objeto, verifica se algum dos valores é um array para realizar a extração//
    return Object.keys(origem).reduce((acumulador, item) => (
      [...acumulador, ...(Array.isArray(item) ? extrairInformacao(item) :  [ [item, origem[item]] ] )]
    ), []);
};

const iniciarCorrecao = (request, response) => {
  
    //Parte responsável por realizar a correção de cada obejto//  

    console.log('Inicia correção')
   
    let semErros = true
    const idxInicial = 0
    const itemCorrigido = { id: '', situacao: '', ordem: '', chave: '', valorChave: ''}
  
    Object.keys(textoCorrecao[idxInicial]).forEach(function(item){
           
        if(item === 'id'){
            itemCorrigido.id = textoCorrecao[idxInicial][item]
        }
        
        if(item === 'situacao'){
            itemCorrigido.situacao = textoCorrecao[idxInicial][item]
        }
        
        if(item === 'ordem'){
            itemCorrigido.ordem = textoCorrecao[idxInicial][item]
        }

        if(item === 'chave'){
            itemCorrigido.chave = textoCorrecao[idxInicial][item]
        }

    })

    const objeto = extrairInformacao(itemCorrigido.chave)
    const chaveCorrecao = { num: null, valor: null }
   
    console.log(idsArray)
   
    //Se um item estiver com status Disponível, então verifica se ele contém algum ERRO//
    if(itemCorrigido.situacao === 'DISPONIVEL'){
        if(typeof itemCorrigido.chave == 'object'){

           
            console.log('Inici22a correção')
            Object.keys(objeto).forEach(function(item){
                
                let itemIdx = objeto[item]
                // idsArray[Object.keys(idsArray).length - 1].id = itemCorrigido.id
                // console.log(idsArray)
                
                if(itemIdx[0] == 'id')
                    chaveCorrecao.num = itemIdx[1] 

                if(itemIdx[0] == 'titulo')
                    chaveCorrecao.valor = itemIdx[1].replace(/\D/g, '')

                if(itemIdx[0] == 'opcoes'){

                    let valoresArray = []
                    
                    Object.values(itemIdx[1]).forEach(function(value){
                        valoresArray.push(value.valor)
                    })
                    
                    if(!valoresArray.includes(chaveCorrecao.valor)){
                        idsArray.push(itemCorrigido.id)
                        codigoErro.codErro = 2
                        textoCorrecao[idxInicial].situacao = 'COM_DEFEITO'
                        semErros = false
                        erros(request, response, chaveCorrecao.num, chaveCorrecao.valor, textoCorrecao[idxInicial])
                    }
                } 
            })
        }
    }
    
    /*else if(idsArray.includes(itemCorrigido.id)){

        console.log('Não existem mais correções disponíveis')
        response.json({ 
            data: null,
            situacao: "ERRO",
            tipo: "SEM_CORRECAO",
            descrição: "Item já foi corrigido, porém não a correção não foi salva!"
        })
    }*/

    //Não foram encontrados erros//
    if(semErros && textoCorrecao[idxInicial].situacao === 'DISPONIVEL'){
        console.log('Inicia cor4reção')
        idsArray.push(itemCorrigido.id)
       geraRespostaSucesso(request, response, textoCorrecao[0])
    }
    console.log('Inicia co55rreção', semErros)
}

const proximaCorrecao = (request, response) => {
   
    //Responsável por chamar a próxima correção caso ainda existe algum item para ser corrigo//

    console.log('Próxima correção')

    if(textoCorrecao === undefined){
        response.json({ 
            data: null,
            situacao: "ERRO",
            tipo: "ARQUIVO_NAO_FOI_LIDO",
            descrição: "Sem arquivo para correção. Primeiro é necessário ler o arquivo de correção ex: localhost:3000/correcoes"
        })

    }
    else if(Object.keys(textoCorrecao).length >= 1){
        iniciarCorrecao(request, response)
    }
   else{
        console.log('Sem itens para corrigir')
        response.json({ 
                        data: null,
                        situacao: "ERRO",
                        tipo: "SEM_CORRECAO",
                        descrição: "Todos os itens disponíveis já foram corrigidos"
                    })
   } 
}

const reservaCorrecao = (request, response) =>{

    console.log('Reservao correção ID=', request.params.id)
    let indiceDeletar; let encontrouCorrecaoRe = false; let mensagemRetornoReservada

    if(Object.keys(correcaoReservada).length < 1){
        let a = JSON.stringify({'tt': 'ff'}, null, ' ')
        a = JSON.parse(a)
        correcaoReservada = [a]
        correcaoReservada.shift()
    }

    Object.keys(textoCorrecao).forEach(function(item){
        if(request.params.id == textoCorrecao[item].id){
            indiceDeletar = item
            correcaoReservada.push(textoCorrecao[item])
            encontrouCorrecaoRe = true
            mensagemRetornoReservada = {
                                    "situacao": "SUCESSO",
                                    "descrição": "Correção reservada com sucesso"
            }
            console.log('Correção reservada')
            //   response.json(mensagemSucesso)
        }
        // else{ //necessário tirar o else
        //     console.log('Não encontrou o ID para ser corrigido')
        // }
    })

   
   // console.log('deposi de reservar', textoCorrecao)
    if(encontrouCorrecaoRe){
        textoCorrecao.splice(indiceDeletar, 1)
        response.json(mensagemRetornoReservada)
    }
    else{
        //Caso o item já tenha sido corrigido ou adicionado a lista de correção reservada//

        let correcaoJaReservada = false
        Object.keys(correcaoReservada).forEach(function(item){
            if(request.params.id == correcaoReservada[item].id){
                correcaoJaReservada = true
                mensagemRetornoReservada = {
                                            "situacao": "ERRO",
                                            "tipo": "ITEM_JA_EXISTENTE",
                                            "descrição": "Item já foi adicionado a lista de correções reservadas, mas não foi salvo"
                                            }
            }
        })

        if(correcaoJaReservada){
            response.json(mensagemRetornoReservada)
        }
        else{
            response.json({
                "situacao": "ERRO",
                "tipo": "ITEM_CORRIGIDO",
                "descrição": "Item já corrigido"
            })
        }
    }
       
}


const lerArquivo = (request, response) => {

    //realizar a leitura de um arquivo no disco
    fs.readFile('files/teste2.json', 'utf-8', function(err, data) {
        if (err) {
            console.log('Erro na leitura')
            return response.status(500).send('Erro ao ler o arquivo.')
        }

        textoCorrecao = JSON.parse(data.toString())
        console.log('Leu arquivo')
        iniciarCorrecao(request, response)
        //response.end()
    });
}

const erros = (request, response, chaveId, chaveValor, textoDefeito) => {
 
    //Responsável por gerar mensagens de erro//
  
    if(Object.keys(textoComDefeito).length < 1){
        let a = JSON.stringify({'tt': 'ff'}, null, ' ')
        a = JSON.parse(a)
        textoComDefeito = [a]
        textoComDefeito.shift()
    }

    textoComDefeito.push(textoDefeito)
    let indiceDeletar

    Object.keys(textoDefeito).forEach(function(valor){
        if(textoDefeito.id == textoDefeito[valor].id){
            indiceDeletar = valor
        }   
    })

    textoCorrecao.splice(indiceDeletar, 1)

    if(codigoErro.codErro == 2){
        response.json({ situacao: "ERRO",
                        tipo: "CHAVE_INCORRETA",
                        descrição: "Chave de correção incorreta. Valor '" + chaveValor + "'não é válido para o item " + chaveId
                     })  
       
    }
}

const geraRespostaSucesso = (request, response, dados) => {
   
    //Responsável por gerar mensagem de sucesso ao corrigir um item correto//

    if(Object.keys(textoCorrigido).length < 1){
        let a = JSON.stringify({'tt': 'ff'}, null, ' ')
        a = JSON.parse(a)
        textoCorrigido = [a]
        textoCorrigido.shift()
    }
    
    const jsonSaida = { data: dados, situacao: "SUCESSO" }
    let indiceDeletar

    Object.keys(textoCorrecao).forEach(function(valor){
        if(dados.id == textoCorrecao[valor].id){
           
            // textoCorrecao[valor] = jsonSaida
            // console.log('aqui', textoCorrecao[valor])
            indiceDeletar = valor
        }   
    })

    if(Object.keys(textoCorrecao).length >= 1)
        textoCorrecao.splice(indiceDeletar, 1)
  
    textoCorrigido.push({ data: dados, situacao: "CORRIGIDA" } )
   
    response.json(jsonSaida)
}

const checaOrdem = (id) => {

    //Responsável por verificar se algum item está sendo salvo fora da ordem estabelecida (ex: ordem 1 -> ordem 2 -> ...)//

    let ordemAux = ''; let ordemOcorreta = true
    Object.keys(textoCorrigido).forEach(function(value){
        Object.keys(textoCorrigido[value]).forEach(function(value2){

            if(id == textoCorrigido[value][value2].id){
                ordemAux = textoCorrigido[value][value2].ordem
            }
        })
    })

    Object.keys(idCorrecao).forEach(function(value){
       
        if(ordemAux > idCorrecao[value].ordem +1){
            ordemOcorreta = false
        }
    })

    if(ordemOcorreta)
        return true
    else
        return false
   
}

const salvarCorrecao = (request, response) => {

    //Responsável por salvar e gerar as mensagem conforme se ocorreu sucesso ou não no processo//

    const mensagemSucesso = { 
                                situacao: 'SUCESSO',
                                descrição: 'Correção salva com sucesso'
                            }

    const mensagemItemExistente = {
                                    situacao: "ERRO",
                                    tipo: "ITEM_CORRIGIDO",
                                    descrição: "Item já corrigido"
                                    }

    const mensagemItemForaOrdem = {
                                    situacao: "ERRO",
                                    tipo: "ITEM_INVALIDO",
                                    descrição: "Item inválido para correção"
                                    }

    let itemExistente = false; let semItens = false;
    let tamanho =  Object.keys(idCorrecao).length
   
    Object.keys(idCorrecao).forEach(function(item){

        //Verificar se um determinado item já foi corrido//
        if(idCorrecao[item].idCorrecao == request.params.id ){
            itemExistente = true
            response.json(mensagemItemExistente)
        }
    })

    if(!checaOrdem(request.params.id)){
        itemExistente = true
        response.json(mensagemItemForaOrdem)
    }

    if(!itemExistente){

        //Verifica e salva o item já corrigido, além de exibir a mensagem de que ele foi salvo corretamente//        
        Object.keys(textoCorrigido).forEach(function(item){
            Object.keys(textoCorrigido[item]).forEach(function(value){
                if(request.params.id == textoCorrigido[item][value].id){
                    semItens = true
                    idCorrecao[tamanho - 1].idCorrecao = (request.params.id)
                    idCorrecao[tamanho - 1].ordem = textoCorrigido[item][value].ordem
                    response.json(mensagemSucesso)
                }
            })
        })
    }

    if(!semItens && !itemExistente){

        let existeNoComDefeito = false

        Object.keys(textoComDefeito).forEach(function(valor){
            if(textoComDefeito[valor].id == request.params.id){
                existeNoComDefeito = true
            }
        })

        if(!existeNoComDefeito){
            response.json({ 
                data: null,
                situacao: "ERRO",
                tipo: "SEM_CORRECAO",
                descrição: "Não existem mais correções disponíveis"
            })
        }
        else{
            response.json({ 
                data: null,
                situacao: "ERRO",
                tipo: "SEM_CORRECAO",
                descrição: "Valor com staus de 'COM_DEFEITO'"
            })
        }
    }

                                 
}

app.use('/', router)
app.post('/correcoes/:id', salvarCorrecao)
app.post('/correcoes/reservadas/:id', reservaCorrecao)
app.get('/correcoes/', lerArquivo)
app.get('/correcoes/proxima/', proximaCorrecao)
app.get('/correcoes/reservadas/', proximaCorrecao)
app.use('*', (req, res) => {
    res.status(404).send({messagem: "Página não encontrada!"})
})

module.exports = app
console.log('API funcionando')