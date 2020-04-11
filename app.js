const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 3000
const fs = require('fs') 

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const router = express.Router()

router.get('/', (req, res) => res.json ({ messagem: 'Web API funcionando!' }))

function readText (request, response) {
    //realizar a leitura de um arquivo no disco
    fs.readFile('files/teste.json', 'utf8', function(err, data) {
        if (err) {
            console.log(response.statusCode)
            console.log('erro na leitura')
            return response.status(500).send('Erro ao ler o arquivo.')
        }

        console.log(response.statusCode)
        // console.log(data)
        let texto = JSON.parse(data.toString())
        //let res = texto.split(" ")
        let teste = texto.chave
        console.log(texto.chave[0].id) // teste de commit

    

        //var query = require('url').parse(request.url, true).query
        //var id = query.id
        //console.log('com query=' + id)
        console.log('com params=' + request.params.id) //pega o /:id da url 

        response.write(data)
        response.end();
        console.log('leu arquivo')
        return teste
    });
  }

app.use('/', router)
app.use('/correcoes/:id', readText)
app.use('*', (req, res) => {
    res.status(404).send({messagem: "Página não encontrada!"})
})

app.listen(port)
console.log('API funcionando')

