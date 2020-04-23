const app = require('../../app')
const supertest = require('supertest')
const request = supertest(app)


describe('Correção não Resrvada', () => {
  it('Deveria iniciar a api', async () => {
   
    const response = await request.get('/')
    expect(response.status).toBe(200)
   
  })

  it('Não deveria dar erro ao tentar iniciar a api', async () => {
    // Sends GET Request to /test endpoint
    const response = await request.get('/')
    expect(response.status).not.toBe(404)
  })

  it('Não deveria iniciar correção se o arquivo .json não for lido', async () => {
    
    proxima = await request.get('/correcoes/proxima')
    expect(proxima.status).toBe(404)
  }) 

  //Leitura do arquivo .json//
  it('Deveria ler o arquivo .json corretamente', async () => {
    // Sends GET Request to /test endpoint
    const response = await request.get('/correcoes')
    expect(response.status).toBe(200)
  })

  it('Não deveria ocorrer erro ao abrir arquivo .json', async () => {
    // Sends GET Request to /test endpoint
    const response = await request.get('/correcoes')
    expect(response.status).not.toBe(500)
  })

  it('Não deveria ocorrer nova tentativa de abrir o arquivo .json', async () => {
    // Sends GET Request to /test endpoint
    const response = await request.get('/correcoes')
    expect(response.status).toBe(200)
  }) 


  //Iniciar as correções//

  it('Não deveria iniciar correção se nenhum arquivo .json tiver sido lido', async () => {
    
    //const lerArquivo = await request.get('/correcoes')
    proxima = await request.get('/correcoes/proxima/')
    expect(proxima.status).not.toBe(404)
  }) 

  it('Deveria iniciar a próxima correção', async () => {
    
    //const lerArquivo = await request.get('/correcoes')
    const proxima = await request.get('/correcoes/proxima')
    expect(proxima.status).toBe(200)
  }) 

  //Não aplicável//
  /*
  it('Deveria iniciar a próxima correção até acabar todas as correções disponíveis', async () => {
    
    //const lerArquivo = await request.get('/correcoes')
    let proxima = { status: 200}
    while(proxima.status == 200){
      proxima = await request.get('/correcoes/proxima')
    }
    //console.log(proxima2)
    expect(proxima.status).not.toBe(200)
  })
  */

  //Salva uma correção não reservada//
  it('Deveria salvar uma correção não reservada', async () => {
    
    const AdicionaReservada = await request.post('/correcoes/9859662')
    expect(AdicionaReservada.status).toBe(200)
  })

})


describe('Correção Reservada', () => {
  // it('Deveria iniciar a api', async () => {
  //     // Sends GET Request to /test endpoint
  //     const response = await request.get('/')
  //     expect(response.status).toBe(200)
  //    // console.log(response)
  //    // expect(response.body.message).toBe('pass!')
  //    // done()
  //   })
  
  //   it('Não deveria dar erro ao tentar iniciar a api', async () => {
  //     // Sends GET Request to /test endpoint
  //     const response = await request.get('/')
  //     expect(response.status).not.toBe(404)
  //   })
  
  //   it('Não deveria iniciar correção se o arquivo .json não for lido', async () => {
      
  //     proxima = await request.get('/correcoes/proxima')
  //     expect(proxima.status).toBe(404)
  //   }) 
  
  //   //Leitura do arquivo .json//
  //   it('Deveria ler o arquivo .json corretamente', async () => {
  //     // Sends GET Request to /test endpoint
  //     const response = await request.get('/correcoes')
  //     expect(response.status).toBe(200)
  //   })
  
  //   it('Não deveria ocorrer erro ao abrir arquivo .json', async () => {
  //     // Sends GET Request to /test endpoint
  //     const response = await request.get('/correcoes')
  //     expect(response.status).not.toBe(500)
  //   })
  
  //   it('Não deveria ocorrer nova tentativa de abrir o arquivo .json', async () => {
  //     // Sends GET Request to /test endpoint
  //     const response = await request.get('/correcoes')
  //     expect(response.status).toBe(200)
  //   }) 

/// corecoes na

it('Não deveria iniciar correção de um item que não foi reservado', async () => {
      
  //const lerArquivo = await request.get('/correcoes')
  proximaReservada = await request.get('/correcoes/proxima/?reservada=true')
  expect(proximaReservada.status).not.toBe(200)
}) 

it('Deveria adicionar uma correção para a lista reservada', async () => {
    
  const AdicionaReservada = await request.post('/correcoes/reservadas/9859664')
  expect(AdicionaReservada.status).toBe(200)
}) 

it('Não deveria adicionar uma correção que não existe para a lista reservada', async () => {
    
  const AdicionaReservada = await request.post('/correcoes/reservadas/9999999')
  expect(AdicionaReservada.status).toBe(404)
})

it('Deveria buscar todas as correções reservadas', async () => {
    
  // const lerArquivo = await request.get('/correcoes')
   const buscaReservada = await request.get('/correcoes/reservadas')
   expect(buscaReservada.status).toBe(200)
 }) 
 



})




/*-------------------------------------*/
// const bodyParser = require('body-parser')
// const fs = require('fs')

// app.use(bodyParser.urlencoded({extended: true}))
// app.use(bodyParser.json())

// const router = express.Router()

//console.log(app)
//leitura de arquivo

// test('Leitura do arquivo', () => {
//     expect(app.lerArquivo()).toBe(4)
// })

// it('Leitura do arquivo', async (res, resp) => {
//    // const api = server.app
//     console.log('tipi', typeof app)
//     let resposta = await api.get("/")
//     console.log(resposta)
//     expect(resposta).toBe(200)
// })

// test('Leitura do arquivo', async () => {
//     const resposta = await app.lerArquivo()

//     expect(resposta).toBe(200)
// })


