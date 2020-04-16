const express = require('express')
const app = express()
const bodyParser = require('body-parser')
//const port = 3000
const fs = require('fs')
//const textoCorrecao = null
var textoCorrecao
const idCorrecao = [{ idCorrecao: '',
                     ordem: '9999'
                   }]
const codigoErro = { codErro: '' }

var textoCorrigido = new Object()
var textoComDefeito = new Object()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const router = express.Router()

router.get('/', (req, res) => res.json ({ messagem: 'Web API funcionando!' }))

const extrair = (origem) => {

    // Se for um array realiza a extração de seus itens
    if (Array.isArray(origem)) {
      //  console.log(origem)
      return origem.reduce((acumulador, item) => [...acumulador, ...extrair(item)], []);
    }
  
    // Se for um objeto, verifica se algum dos valores é um array para realizar a extração
    return Object.keys(origem).reduce((acumulador, item) => (
      [...acumulador, ...(Array.isArray(item) ? extrair(item) :  [ [item, origem[item]] ] )]
    ), []);
};

const extrair2 = (origem) => {

    // Se for um array realiza a extração de seus itens
    if (Array.isArray(origem)) {
      //  console.log(origem)
      return origem.reduce((acumulador, item) => [...acumulador, ...extrair(item)], []);
    }
  
    // Se for um objeto, verifica se algum dos valores é um array para realizar a extração
    return Object.values(origem).reduce((acumulador, item) => (
      [...acumulador, ...(Array.isArray(item) ? extrair(item) :  [item + '/' + origem[item]] )]
    ), []);
};

const setIdOrdem = (objeto) => {
    Object.keys(objeto).forEach(function(item){
        //console.log(item + '=' + objeto[item])
        if(item === 'id')
            idCorrecao.idCorrecao = objeto[item]

        if(item === 'ordem')
            idCorrecao.ordem = objeto[item]
        
    })

    console.log(idCorrecao.idCorrecao, idCorrecao.ordem) 
}

const getID = () => {
    return idCorrecao.idCorrecao
}

const getOrdem = () => {
    return idCorrecao.ordem
}


const iniciarCorrecao = (request, response) => {
   // console.log(typeof textoCorrecao)

   // console.log('ULTI', textoCorrigido)

    // fs.writeFile('meuarquivo.txt', JSON.stringify(textoCorrecao), function(erro) {
    //     if(erro) {
    //         throw erro;
    //     }
    //     console.log("Arquivo salvo");
    // }); 
    //return response.status(200).send('Deu')

    //console.log(extrair(textoCorrecao));
    //extrair(textoCorrecao)
   
    //setIdOrdem(textoCorrecao)
    //console.log(extrair(objeto))  

    console.log('texto', typeof textoCorrecao[0].chave, textoCorrecao[0].chave)


    console.log('iniciar correcao') //, textoCorrecao[0])

    console.log('Tam = ', Object.keys(textoCorrecao).length)
   
   
    let semErros = true
    const idxInicial = 0
    const itemCorrigido = { id: '', situacao: '', ordem: '', chave: '', valorChave: ''}
  
    Object.keys(textoCorrecao[idxInicial]).forEach(function(item){
       // console.log(item + '=' + textoCorrecao[0][item])
       
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

        //console.log('priemara')
    })
    //console.log(typeof extrair(itemCorrigido.chave))

    const objeto = extrair(itemCorrigido.chave)
    const chaveCorrecao = { num: null, valor: null }
    console.log('segunda', itemCorrigido.situacao)
    console.log('segunda id ', itemCorrigido.id)
    if(itemCorrigido.situacao === 'DISPONIVEL'){
        
      //  if(itemCorrigido.ordem < getOrdem()){
            console.log('teste')

            if(typeof itemCorrigido.chave == 'object'){
                Object.keys(objeto).forEach(function(item){
                    //console.log(item + '=' + objeto[item])

                    //console.log(typeof objeto[item])
                    let itemIdx = objeto[item] // split('/')
                    //console.log(itemIdx)
                    if(itemIdx[0] == 'id'){
                        chaveCorrecao.num = itemIdx[1] 
                        //console.log('ID', chaveCorrecao.num)
                    }

                    if(itemIdx[0] == 'titulo'){
                        chaveCorrecao.valor = itemIdx[1].replace(/\D/g, '')
                        //console.log('TITULO', chaveCorrecao.valor)
                    }

                    if(itemIdx[0] == 'opcoes'){
                        //console.log(' tamanhoo ooooooo', Object.keys(itemIdx[1]).length)
                        let valoresArray = []
                        //console.error( itemIdx[1])
                        Object.values(itemIdx[1]).forEach(function(value){
                           // console.log(value.valor)
                            valoresArray.push(value.valor)
                        })
                        //console.log(valoresArray)
                        if(!valoresArray.includes(chaveCorrecao.valor)){
                            //console.log('Valor está dentro')
                            codigoErro.codErro = 2
                            textoCorrecao[idxInicial].situacao = 'COM_DEFEITO'
                            semErros = false
                            erros(request, response, chaveCorrecao.num, chaveCorrecao.valor, textoCorrecao[idxInicial])

                        }
                    } 
                })
           // }
        }
    }

    
    console.log('SITAUAO', textoCorrecao[idxInicial].situacao )
    if(semErros){
       geraRespostaSucesso(request, response, textoCorrecao[0])
       console.log('ENtrou')
    }
    //salvarCorrecao(request, response)
    //setIdOrdem(textoCorrecao[0])
    //response.end()
}

const proximaCorrecao = (request, response) => {
   // console.log('proxima correcao', textoCorrecao)
   
    console.log('proxima')
    if(Object.keys(textoCorrecao).length >= 1){
        iniciarCorrecao(request, response)
    }
   else{
        response.json({ 
                        data: null,
                        situacao: "ERRO",
                        tipo: "SEM_CORRECAO",
                        descrição: "Não existem mais correções disponíveis"
                    })
   } 
    

}

const lerArquivo = (request, response) => {
    //realizar a leitura de um arquivo no disco
    fs.readFile('files/tt2.json', 'utf-8', function(err, data) {
        if (err) {
            //console.log(response.statusCode)
            console.log('erro na leitura')
            return response.status(500).send('Erro ao ler o arquivo.')
        }

        //console.log(response.statusCode)
        // console.log(data)
        textoCorrecao = JSON.parse(data.toString())
        //let res = texto.split(" ")
        let teste = textoCorrecao.chave
        //console.log(textoCorrecao.chave[0].id) 

        //var query = require('url').parse(request.url, true).query
        //var id = query.id
        //console.log('com query=' + id)
        //console.log('com params=' + request.params.id) //pega o /:id da url 

        //response.write('Arquivo lido com sucesso! \n -Solicite a correcao (correcoes/proxima) \n\n') // + data)
        console.log('Leu arquivo')
        iniciarCorrecao(request, response)
        //response.end()
       
      
       // return teste
    });
}

const erros = (request, response, chaveId, chaveValor, textoDefeito) => {
    //console.log('fgfdgdf', codigoErro.codErro)
    console.log('tedeifot', textoDefeito)
  
    if(Object.keys(textoComDefeito).length < 1){
        let a = JSON.stringify({'tt': 'ff'}, null, ' ')
        a = JSON.parse(a)
        textoComDefeito = [a]
        textoComDefeito.shift()
    }

    textoComDefeito.push(textoDefeito)

    let indiceDeletar

   // console.log('outro defeito', textoComDefeito)

    Object.keys(textoDefeito).forEach(function(valor){
        //console.log('aqui', valor, textoCorrecao[valor])
        if(textoDefeito.id == textoDefeito[valor].id){
            indiceDeletar = valor
        }   
    })
  //  console.log('dados original', textoCorrecao)
    textoCorrecao.splice(indiceDeletar, 1)
   // console.log('dados alteado', textoCorrecao)

    if(codigoErro.codErro == 2){
        response.json({ situacao: "ERRO",
                        tipo: "CHAVE_INCORRETA",
                        descrição: "Chave de correção incorreta. Valor '" + chaveValor + "'não é válido para o item " + chaveId
                     })  
       
    }
}

const geraRespostaSucesso = (request, response, dados) => {
    let tam = Object.keys(textoCorrigido).length
   // console.log('tAM', tam, textoCorrigido)
    if(Object.keys(textoCorrigido).length < 1){
        let a = JSON.stringify({'tt': 'ff'}, null, ' ')
        a = JSON.parse(a)
        textoCorrigido = [a]
        textoCorrigido.shift()
    }
    console.log('impre', textoCorrigido)
    //console.log('tamanha', Object.keys(textoCorrigido).length)
  //  let tam = Object.keys(textoCorrigido).length

    // let situacao = dados.situacao
    // delete dados.situacao
    const jsonSaida = { data: dados, situacao: "SUCESSO" }

    //console.log('dados', dados)
     //apagar valores do objeto original
    let indiceDeletar
    Object.keys(textoCorrecao).forEach(function(valor){
        //console.log('aqui', valor, textoCorrecao[valor])
        if(dados.id == textoCorrecao[valor].id){
            indiceDeletar = valor
        }   
    })
    //delete textoCorrecao[indiceDeletar]
    console.log('tamanho no fim', Object.keys(textoCorrecao).length)
    if(Object.keys(textoCorrecao).length >= 1)
        textoCorrecao.splice(indiceDeletar, 1)
    //console.log('correcao', textoCorrecao)
    

    textoCorrigido.push(jsonSaida)
   

   // textoCorrigido = Object.assign({}, textoCorrigido)

   // console.log('-----------',typeof textoCorrigido, textoCorrigido)

  //  let aux = Object.assign({}, textoCorrigido)
    //JSON.stringify(jsonSaida)
    // aux = JSON.parse(aux)
    // let teste = Object.assign({}, jsonSaida)
    // console.log('-----------',typeof aux, aux)
    // aux = {...Object.assign({}, textoCorrigido), ...jsonSaida }
    // aux = {...jsonSaida, ...{ t: 'fdfs', g: 'fgd'} }
    //textoCorrigido = jsonSaida
    //let teste = Object.assign(textoCorrigido, jsonSaida)
   //console.log('-----------',typeof aux, aux)
    //console.log('meu obj', textoCorrigido, Object.keys(textoCorrigido).length, teste)
    response.json(jsonSaida)
   // let a = JSON.stringify({ id: 'tsetes', situacao: 'teste', ordem: '656546', chave: 'dfds3434', valorChave: 'ii'}, null, "\n")

//    console.log(JSON.stringify({ id: 'tsetes', situacao: 'teste', ordem: '656546', chave: 'dfds3434', valorChave: 'ii'}, null, 4))
//     response.json(JSON.stringify({ id: 'tsetes', situacao: 'teste', ordem: '656546', chave: 'dfds3434', valorChave: 'ii'}, null, 4))
    //response.json(a)
}

const checaOrdem = (id) => {

    console.table(textoCorrigido)

    let ordemAux = ''; let ordemOcorreta = true
    Object.keys(textoCorrigido).forEach(function(value){
        Object.keys(textoCorrigido[value]).forEach(function(value2){
        //console.log('ortextocorreidoedem', value, textoCorrigido[value])
            if(id == textoCorrigido[value][value2].id){
                ordemAux = textoCorrigido[value][value2].ordem
            }
        })
    })

    console.log('valors', idCorrecao)
    console.log('valorr', typeof ordemAux, ordemAux)
    Object.keys(idCorrecao).forEach(function(value){
        console.log('oredem', value, idCorrecao[value])
        console.log('valors', idCorrecao[value].ordem +1)
        if(ordemAux > idCorrecao[value].ordem +1){
            console.log('não pode')
            ordemOcorreta = false
        }
    })
    console.log('passo')
    if(ordemOcorreta)
        return true
    else
        return false
   
}

const salvarCorrecao = (request, response) => {

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

    console.log('entrou-salvar', request.params.id)

  //  console.log('mengam', JSON.parse(mensagemSucesso))

     let tamanho =  Object.keys(idCorrecao).length
    // if(tamanho < 1){
    //     let a = JSON.stringify({'tt': 'ff'}, null, ' ')
    //     a = JSON.parse(a)
    //     idCorrecao = [a]
    // }
// idCorrecao[0] = {idCorrecao: '',
// ordem: '9999'}
// idCorrecao[1] = {idCorrecao: '',
// ordem: '9999'}
    

    Object.keys(idCorrecao).forEach(function(item){
        
      //  console.log('etete', item, idCorrecao[item])
        if(idCorrecao[item].idCorrecao == request.params.id ){
           // console.log('ETETETE')
            response.json(JSON.stringify(mensagemItemExistente, 0, 4))
            itemExistente = true
        }

    })

    if(!checaOrdem(request.params.id)){
        response.json(JSON.stringify(mensagemItemForaOrdem, 0, 4))
        itemExistente = true
    }

    console.log( 'simii', Object.keys(idCorrecao).length)

    
    if(!itemExistente){
        Object.keys(textoCorrigido).forEach(function(item){

            Object.keys(textoCorrigido[item]).forEach(function(value){
         console.log('id', request.params.id, textoCorrigido[item])

            //console.log('valores', value+  '=' +textoCorrigido[item][value])
            // if(value == 'data'){
            //     //Object.keys(textoCorrigido[item]).forEach(function(value){
            //     console.log('data', textoCorrigido[item][value].id)
            // }
            
                if(request.params.id == textoCorrigido[item][value].id){

                   // if()
                // console.log( 'simii', idCorrecao[tamanho - 1])
                    semItens = true
                    idCorrecao[tamanho - 1].idCorrecao = (request.params.id)
                    idCorrecao[tamanho - 1].ordem = textoCorrigido[item][value].ordem
                    response.json(JSON.stringify(mensagemSucesso, 0, 4))
                }
            })
        })

        if(!semItens){
            response.json({ 
                data: null,
                situacao: "ERRO",
                tipo: "SEM_CORRECAO",
                descrição: "Não existem mais correções disponíveis"
            })
        }
    }

                                 
}

app.use('/', router)
app.post('/correcoes/:id', salvarCorrecao)
app.get('/correcoes/', lerArquivo)
app.get('/correcoes/proxima/', proximaCorrecao)
app.use('*', (req, res) => {
    res.status(404).send({messagem: "Página não encontrada!"})
})

module.exports = app
console.log('API funcionando')

  
