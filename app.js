const express = require('express')
const app = express()
const bodyParser = require('body-parser')
//const port = 3000
const fs = require('fs')
//const textoCorrecao = undefined

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const router = express.Router()

router.get('/', (req, res) => res.json ({ messagem: 'Web API funcionando!' }))

function correcao (textoCorrecao){
    console.log(typeof textoCorrecao)

    // fs.writeFile('meuarquivo.txt', JSON.stringify(textoCorrecao), function(erro) {
    //     if(erro) {
    //         throw erro;
    //     }
    //     console.log("Arquivo salvo");
    // }); 
    //return response.status(200).send('Deu')

    textoCorrecao.forEach(function(item, idx){
        console.log(idx, item)
    });


    
}

function lerArquivo (request, response) {
    //realizar a leitura de um arquivo no disco
    fs.readFile('files/teste.json', 'utf8', function(err, data) {
        if (err) {
            console.log(response.statusCode)
            console.log('erro na leitura')
            return response.status(500).send('Erro ao ler o arquivo.')
        }

        console.log(response.statusCode)
        // console.log(data)
         const textoCorrecao = JSON.parse(data.toString())
        //let res = texto.split(" ")
        let teste = textoCorrecao.chave
        console.log(textoCorrecao.chave[0].id) 

        //var query = require('url').parse(request.url, true).query
        //var id = query.id
        //console.log('com query=' + id)
        console.log('com params=' + request.params.id) //pega o /:id da url 

        response.write(data)
        correcao(textoCorrecao)
        response.end()
        console.log('leu arquivo')
      
       // return teste
    });
}

app.use('/', router)
app.use('/correcoes/proxima/', lerArquivo)
//app.use('/correcoes/', lerArquivo)

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