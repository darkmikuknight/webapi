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
    return Object.values(origem).reduce((acumulador, item) => (
      [...acumulador, ...(Array.isArray(item) ? extrair(item) : [item] )]
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



function iniciarCorrecao (textoCorrecao){
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

    textoCorrecao[0]
   
   // proximaCorrecao()

    const itemCorrigido = { id: '', situacao: '', ordem: '', chave: '', valorChave: ''}

    Object.keys(textoCorrecao[0]).forEach(function(item){
        console.log(item + '=' + textoCorrecao[0][item])
       
        if(item === 'id'){
            itemCorrigido.id = textoCorrecao[0][item]
        }
        
        if(item === 'situacao'){
            itemCorrigido.situacao = textoCorrecao[0][item]
        }
        
        if(item === 'ordem'){
            itemCorrigido.ordem = textoCorrecao[0][item]
        }

        if(item === 'chave'){
            itemCorrigido.chave = textoCorrecao[0][item]
        }
    })

    if(itemCorrigido.situacao === 'DISPONIVEL'){
        
        if(itemCorrigido.ordem < getOrdem()){
            console.log('teste')

            if(typeof itemCorrigido.chave == 'object'){
                Object.keys(itemCorrigido.chave).forEach(function(item){
                    console.log(item + '=' + itemCorrigido.chave[item])
                })
            }

        }
    }

    // if(typeof itemCorrigido.chave == 'object')
    // console.log(itemCorrigido)

    setIdOrdem(textoCorrecao[0])
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
    fs.readFile('files/tt2.json', 'utf8', function(err, data) {
        if (err) {
            console.log(response.statusCode)
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

        response.write('Arquivo lido com sucesso! \n -Solicite a correcao (correcoes/proxima) \n\n' + data)
        console.log('Leu arquivo')
        iniciarCorrecao(textoCorrecao)
        response.end()
       
      
       // return teste
    });
}

app.use('/', router)
app.get('/correcoes/proxima/', iniciarCorrecao)
app.use('/correcoes/', lerArquivo)
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



  // Teste da função
  const objeto =  {
    "logistics_provider": "{{lp_name}}",
    "shipper": "{{co_common_name}}",
    "invoice_key": "{{ae_identifier}}",
    "invoice_series": "{{ae_identifier}}",
    "volume_number": "1",
      "events": [
    {
          "event_date": "{{ae_date}}",
          "original_code": "{{ae_code_event}}",
          "original_message": "{{ae_comment}}"
    }]
  };
  
