const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const fs = require('fs')
const idCorrecao = {}
const codigoErro = {codErro: ''}
const idsArray = []
var textoCorrecao //talvez usar let em vez de var?
var textoCorrigido = {}
var textoComDefeito = {}
var correcaoReservada = {} 

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const router = express.Router()
router.get('/', (request, response) => response.status(200).json({messagem: 'Web API funcionando!'}))

const extraiInformacao = (origem) => {

    //Se for um array realiza a extração de seus itens//
    if(Array.isArray(origem)){
      return origem.reduce((acumulador, item) => [...acumulador, ...extraiInformacao(item)], []);
    }
  
    //Se for um objeto, verifica se algum dos valores é um array para realizar a extração//
    return Object.keys(origem).reduce((acumulador, item) => (
      [...acumulador, ...(Array.isArray(item) ? extraiInformacao(item) : [ [item, origem[item]] ] )]
    ), []);
}

const iniciaCorrecao = (request, response, textoParaCorrigir) => {
  
    //Parte responsável por realizar a correção de cada obejto//  
    //console.log('Inicia correção')

    let semErros = true
    const idxInicial = 0
    const itemCorrigido = { id: '', situacao: '', ordem: '', chave: '', valorChave: ''}
  
    Object.keys(textoParaCorrigir[idxInicial]).forEach(function(item){

        if(item === 'id'){
            itemCorrigido.id = textoParaCorrigir[idxInicial][item]
        }
        
        if(item === 'situacao'){
            itemCorrigido.situacao = textoParaCorrigir[idxInicial][item]
        }
        
        if(item === 'ordem'){
            itemCorrigido.ordem = textoParaCorrigir[idxInicial][item]
        }

        if(item === 'chave'){
            itemCorrigido.chave = textoParaCorrigir[idxInicial][item]
        }

    })

    const objeto = extraiInformacao(itemCorrigido.chave)
    const chaveCorrecao = { num: null, valor: null }
   
    //console.log(idsArray)
   
    //Se um item estiver com status Disponível, então verifica se ele contém algum ERRO//
    if(itemCorrigido.situacao === 'DISPONIVEL'){
        if(typeof itemCorrigido.chave == 'object'){

            Object.keys(objeto).forEach(function(item){
                
                let itemIdx = objeto[item]
                
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
                        textoParaCorrigir[idxInicial].situacao = 'COM_DEFEITO'
                        semErros = false
                        erros(request, response, chaveCorrecao.num, chaveCorrecao.valor, textoParaCorrigir[idxInicial])
                    }
                } 
            })
        }
    }
    
    /*
    else if(idsArray.includes(itemCorrigido.id)){

        console.log('Não existem mais correções disponíveis')
        response.json({ 
            data: null,
            situacao: "ERRO",
            tipo: "SEM_CORRECAO",
            descrição: "Item já foi corrigido, porém não a correção não foi salva!"
        })
    }
    */

    //Não foram encontrados erros//
    if(semErros){   // & textoParaCorrigir[idxInicial].situacao === 'DISPONIVEL'){
        idsArray.push(itemCorrigido.id)
        geraRespostaSucesso(request, response, textoParaCorrigir[idxInicial])
    }
}

const proximaCorrecao = (request, response) => {
   
    //Responsável por chamar a próxima correção caso ainda existe algum item para ser corrigo//
    //console.log('Próxima correção')

    if(textoCorrecao === undefined){
        response.status(404).json({ 
            data: null,
            situacao: "ERRO",
            tipo: "ARQUIVO_NAO_FOI_LIDO",
            descrição: "Sem arquivo para correção. Primeiro é necessário ler o arquivo de correção ex: localhost:3000/correcoes"
        })

    }
    else if(request.query.reservada === 'true' || (Object.keys(textoCorrecao).length == 0 && Object.keys(correcaoReservada).length >= 1)){
       //console.log('Próxima correção reservada')

        if(Object.keys(correcaoReservada).length == 0){
            response.status(404).json({ 
                data: null,
                situacao: "ERRO",
                tipo: "SEM_CORRECAO_RESERVADA",
                descrição: "Não foi encontrada nenhuma correção reservada."
            })
        }
        else{
            iniciaCorrecao(request, response, correcaoReservada)
        }
    }
    else if(Object.keys(textoCorrecao).length >= 1){
        iniciaCorrecao(request, response, textoCorrecao)
    }
   else{
       // console.log('Sem itens para corrigir')
        response.status(404).json({ 
                        data: null,
                        situacao: "ERRO",
                        tipo: "SEM_CORRECAO",
                        descrição: "Todos os itens disponíveis já foram corrigidos"
        })
   } 
}

const reservaCorrecao = (request, response) =>{

    let indiceDeletar
    let encontrouCorrecaoRe = false
    let mensagemRetornoReservada

    if(Object.keys(correcaoReservada).length < 1){
        let a = JSON.stringify({'tt': 'ff'}, null, ' ')
        a = JSON.parse(a)
        correcaoReservada = [a]
        correcaoReservada.shift()
    }

    if(textoCorrecao !== undefined ){
        //Reserva a correção que foi solicitada caso ela exista nos dados que fora lidos do .json//

        Object.keys(textoCorrecao).forEach(function(item){
            if(request.params.id == textoCorrecao[item].id){
                indiceDeletar = item
                textoCorrecao[item].situacao = "RESERVADA"
                correcaoReservada.push(textoCorrecao[item])
                encontrouCorrecaoRe = true
                mensagemRetornoReservada = {
                                        "situacao": "SUCESSO",
                                        "descrição": "Correção reservada com sucesso"
                }
                //console.log('Correção reservada')
            }
        })
    }

    if(encontrouCorrecaoRe){
        textoCorrecao.splice(indiceDeletar, 1)
        response.status(200).json(mensagemRetornoReservada)
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
            response.status(200).json(mensagemRetornoReservada)
        }
        else{

            //Caso o item já tinha sido corrigido//
            if(idsArray.includes(request.params.id)){
                response.status(200).json({
                    "situacao": "ERRO",
                    "tipo": "ITEM_CORRIGIDO",
                    "descrição": "Item já corrigido"
                })
            }
            else if(textoCorrecao === undefined){

                //Caso tenha-se usado a opção para reservar um item, mas não tenha sido feita a leitura do .json//
                response.status(404).json({
                    "situacao": "ERRO",
                    "tipo": "NAO_ENCONTRADO",
                    "descrição": "Não foi feita a leitura do arquivo .json!"
                })
            }
            else{
                response.status(404).json({
                    "situacao": "ERRO",
                    "tipo": "NAO_ENCONTRADO",
                    "descrição": "Não foi encontrado nenhum item com o ID '"+ request.params.id +"'!"
                })
            }

           
        }
    }       
}

const lerArquivo = (request, response) => {

    //Realizaa a leitura de um arquivo no disco//
    fs.readFile('files/teste2.json', 'utf-8', function(err, data){
        if(err){
            //console.log('Erro na leitura')
            return response.status(500).send('Erro ao ler o arquivo.')
        }

        if(textoCorrecao === undefined){
            textoCorrecao = JSON.parse(data.toString())
            //console.log('Leu arquivo')
            response.status(200).json({
                mensagem: "O arquivo lido com sucesso! Inicie as correções com ../correcoes/proxima/"
            })
        }
        else{
            //Caso tenha-se tentado ler o arquivo logo em seguida de já ter lido//
            response.status(200).json({
                mensagem: "Atenção, o arquivo já foi lido! Inicie as correções com ../correcoes/proxima/"
            })
        }
    })
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

    if(request.query.reservada == 'true'){
        Object.keys(correcaoReservada).forEach(function(valor){
            if(textoDefeito.id == correcaoReservada[valor].id){
                indiceDeletar = valor
            }   
        })
    
        correcaoReservada.splice(indiceDeletar, 1)
    }
    else{
        Object.keys(textoCorrecao).forEach(function(valor){
            if(textoDefeito.id == textoCorrecao[valor].id){
                indiceDeletar = valor
            }   
        })

        textoCorrecao.splice(indiceDeletar, 1)
    }

    if(codigoErro.codErro == 2){
        response.status(200).json({ situacao: "ERRO",
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
    let naoEhReservada = false

    Object.keys(textoCorrecao).forEach(function(valor){
        if(dados.id == textoCorrecao[valor].id){
           
            indiceDeletar = valor
            naoEhReservada = true
        }   
    })

    if(!naoEhReservada){

        Object.keys(correcaoReservada).forEach(function(valor){
            if(dados.id == correcaoReservada[valor].id){
                indiceDeletar = valor
            }   
        })

        if(Object.keys(correcaoReservada).length >= 1)
            correcaoReservada.splice(indiceDeletar, 1)
    }
    else{
        if(Object.keys(textoCorrecao).length >= 1)
            textoCorrecao.splice(indiceDeletar, 1)
    }

    textoCorrigido.push({ data: dados, situacao: "CORRIGIDA" })
    response.status(200).json(jsonSaida)
}

const checaOrdem = (id) => {

    //Responsável por verificar se algum item está sendo salvo fora da ordem estabelecida (ex: ordem 1 -> ordem 2 -> ...)//

    let ordemAux = ''
    let ordemCorreta = true

    Object.keys(textoCorrigido).forEach(function(item){
        Object.keys(textoCorrigido[item]).forEach(function(valor){

            if(id == textoCorrigido[item][valor].id){
                ordemAux = textoCorrigido[item][valor].ordem
            }
        })
    })

    if(ordemAux === ''){
        Object.keys(correcaoReservada).forEach(function(item){
            Object.keys(correcaoReservada[item]).forEach(function(valor){
                if(id == correcaoReservada[item][valor].id){
                    ordemAux = correcaoReservada[item][valor].ordem
                }
            })
        })
    }

    Object.keys(idCorrecao).forEach(function(item){

        if(ordemAux > idCorrecao[item].ordem + 1){
            ordemCorreta = false
        }
        else{
            ordemCorreta = true
        }
    })

    if(ordemCorreta)
        return true
    else
        return false
}

const salvaCorrecao = (request, response) => {

    //Responsável por salvar e gerar as mensagens, conforme se ocorreu sucesso ou não no processo//

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

    let itemExistente = false
    let itemJaCorrigido = false
    let tamanho = Object.keys(idCorrecao).length
   
    Object.keys(idCorrecao).forEach(function(item){
        //Verifica se um determinado item já foi corrido//

        if(idCorrecao[item].idCorrecao == request.params.id ){
            itemExistente = true
            response.status(404).json(mensagemItemExistente)
        }
    })

    if(!checaOrdem(request.params.id)){
        itemExistente = true
        response.status(404).json(mensagemItemForaOrdem)
    }

    if(!itemExistente){

        //Verifica e salva o item já corrigido, além de exibir a mensagem de que ele foi salvo corretamente//

        Object.keys(textoCorrigido).forEach(function(item){
            Object.keys(textoCorrigido[item]).forEach(function(valor){

                if(request.params.id == textoCorrigido[item][valor].id){

                    let aux = { idCorrecao: request.params.id, 
                                ordem: textoCorrigido[item][valor].ordem
                              }
                    itemJaCorrigido = true
                    idCorrecao[tamanho] = aux
                    response.status(200).json(mensagemSucesso)
                }
            })
        })

        //Savla o item com a correção reservada//
        if(!itemJaCorrigido){

            Object.keys(correcaoReservada).forEach(function(item){
                Object.keys(correcaoReservada[item]).forEach(function(valor){

                    if(request.params.id == correcaoReservada[item][valor].id){

                        itemJaCorrigido = true
                        idCorrecao[tamanho - 1].idCorrecao = (request.params.id)
                        idCorrecao[tamanho - 1].ordem = correcaoReservada[item][valor].ordem
                        response.status(200).json(mensagemSucesso)
                    }
                })
            })
        }
    }

    if(!itemJaCorrigido && !itemExistente){
        /*Caso o item NÃO tenha sido salvo e sua ordem estiver conforme a regra 3, então se verificar se
        / ele está com status de COM_DEFEITO ou se não existem nenhuma ID que foi informada ou se não existem
        / mais itens para correção.
        */

        let existeItemComDefeito = false

        Object.keys(textoComDefeito).forEach(function(item){
            if(textoComDefeito[item].id == request.params.id){
                existeItemComDefeito = true
            }
        })

        if(!idsArray.includes(request.params.id) && !existeItemComDefeito){
            response.status(404).json({ 
                data: null,
                situacao: "ERRO",
                tipo: "ID_INVALIDO",
                descrição: "Não foi encontrado nenhuma correção com ID: '" + request.params.id + "'."
            })
        }
        else if(idsArray.includes(request.params.id) && !existeItemComDefeito){
            response.status(404).json({ 
                data: null,
                situacao: "ERRO",
                tipo: "SEM_CORRECAO",
                descrição: "Não existem mais correções disponíveis"
            })
        }
        else{
            response.status(404).json({ 
                data: null,
                situacao: "ERRO",
                tipo: "SEM_CORRECAO",
                descrição: "Valor com staus de 'COM_DEFEITO'"
            })
        }
    }                                 
}

const listaReservadas = (request, response) =>{
    //Retornar um json com todos os itens que já foram reservados//
    
    if(Object.keys(correcaoReservada).length >= 1)
        response.status(200).json(correcaoReservada)
    else{
        response.status(200).json({mensagem: "Não foram encontrados itens para correção reservada!"})
    }
}

app.use('/', router)
app.post('/correcoes/:id', salvaCorrecao)
app.post('/correcoes/reservadas/:id', reservaCorrecao)
app.get('/correcoes/', lerArquivo)
app.get('/correcoes/proxima/', proximaCorrecao)
app.get('/correcoes/reservadas/', listaReservadas)
app.use('*', (req, res) => {
    res.status(404).send({messagem: "Página não encontrada!"})
})

module.exports = app
console.log('API funcionando')