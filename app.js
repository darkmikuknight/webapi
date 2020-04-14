const express = require('express')
const app = express()
const bodyParser = require('body-parser')
//const port = 3000
const fs = require('fs')
//const textoCorrecao = null
var textoCorrecao
const idCorrecao = { idCorrecao: '',
                     ordem: '9999'
                   }
const codigoErro = { codErro: '' }

var textoCorrigido = new Object()

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


function iniciarCorrecao (request, response, textoCorrecao){
    //console.log(typeof textoCorrecao)

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

    console.log('iniciar correcao') //, textoCorrecao[0])

    console.log('Tam = ', Object.keys(textoCorrecao).length)
   
   // proximaCorrecao()
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
    })
    //console.log(typeof extrair(itemCorrigido.chave))

    const objeto = extrair(itemCorrigido.chave)
    const chaveCorrecao = { num: null, valor: null }

    if(itemCorrigido.situacao === 'DISPONIVEL'){
        
        if(itemCorrigido.ordem < getOrdem()){
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
                            erros(request, response, chaveCorrecao.num, chaveCorrecao.valor)

                        }
                    } 
                })
            }
        }
    }

    // if(typeof itemCorrigido.chave == 'object')
    //console.log(textoCorrecao)
    geraRespostaSucesso(request, response, textoCorrecao[0])
    //salvarCorrecao(request, response)
    //setIdOrdem(textoCorrecao[0])
}

function proximaCorrecao(){
    console.log('proxima correcao', textoCorrecao)
    
    Object.keys(textoCorrecao).forEach(function(item){
        //console.log(item + '=' + objeto[item])
        // console.log(textoCorrecao.map(e => e.id).indexOf(textoCorrecao[item]) )
        // console.log(textoCorrecao.findIndex(item2 => item2.id === textoCorrecao[item]))


        if(item === 'id'){
           if(textoCorrecao[item] != getID()){
              // console.log('id igual', textoCorrecao)
             console.log(textoCorrecao.findIndex(item2 => item2.id === textoCorrecao[item]))

               setIdOrdem(textoCorrecao)
           }
        }

        //if(item === 'ordem')
        
    })

}

function lerArquivo (request, response) {
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
        iniciarCorrecao(request, response, textoCorrecao)
        //response.end()
       
      
       // return teste
    });
}

const erros = (request, response, chaveId, chaveValor) => {
    console.log('fgfdgdf', codigoErro.codErro)

    if(codigoErro.codErro == 2){
        response.json({ situacao: "ERRO",
                        tipo: "CHAVE_INCORRETA",
                        descrição: "Chave de correção incorreta. Valor '" + chaveValor + "'não é válido para o item " + chaveId
                     })  
    }
}

const geraRespostaSucesso = (request, response, dados) => {

    let a = JSON.stringify({'t': 'fdfs', 'g': 'fgd' }, null, ' ')
    a = JSON.parse(a)
    textoCorrigido = [a]
    console.log('tamanha', Object.keys(textoCorrigido).length)
    let tam = Object.keys(textoCorrigido).length
    //let situacao = dados.situacao
    delete dados.situacao
    const jsonSaida = { data: dados, situacao: "SUCESSO" }
   // console.log('tipo ', textoCorrigido)
    //console.log(typeof (jsonSaida))
    textoCorrigido[tam] = jsonSaida
    console.log('-----------',typeof textoCorrigido, textoCorrigido)
    let aux = Object.assign({}, textoCorrigido)
    //JSON.stringify(jsonSaida)
   // aux = JSON.parse(aux)
   let teste = Object.assign({}, jsonSaida)
    console.log('-----------',typeof aux, aux)
    aux = {...Object.assign({}, textoCorrigido), ...jsonSaida }
    aux = {...jsonSaida, ...{ t: 'fdfs', g: 'fgd'} }
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

const salvarCorrecao = (request, response) => {

    const mensagemSucesso = { 
        situacao: "SUCESSO",
        descrição: "Correção salva com sucesso"
    }

    Object.keys(textoCorrigido).forEach(function(item){

       // console.log('id', request.params.id, textoCorrigido[item])

       //console.log(item+  '=' +textoCorrigido[item])
        if(item == 'id'){
            if(request.params.id == textoCorrigido[item]){
                response.json(JSON.stringify(mensagemSucesso, 0, 4))
            }
        }
    })

                                 
}


app.use('/', router)
app.post('/correcoes/:id', salvarCorrecao)
//app.get('/correcoes/proxima/', iniciarCorrecao)
app.get('/correcoes/', lerArquivo)
app.use('*', (req, res) => {
    res.status(404).send({messagem: "Página não encontrada!"})
})

module.exports = app
//app.listen(port)
console.log('API funcionando')



// const express = require('express')
// const app = express()

// app.use((req, res) => {
//         res.status(200).send({messagem: "Págifgfgdgfna não encontrada!"})
//     })

//     module.exports = app

  