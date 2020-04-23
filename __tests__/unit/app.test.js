const app = require('../../app')
const supertest = require('supertest')
const request = supertest(app)

describe('Inicializar API', () => {

  //Testes para verificar se a api irá funciconar ou retornar algum erro//
  it('Deveria iniciar a api', async () => {
   
    const response = await request.get('/')
    expect(response.status).toBe(200)
   
  })

  it('Não deveria dar erro ao tentar iniciar a api', async () => {
    // Sends GET Request to /test endpoint
    const response = await request.get('/')
    expect(response.status).not.toBe(404)
  })

})

describe('Abertura do arquvo .json', () => {

  it('Não deveria iniciar correção se o arquivo .json não for lido', async () => {
    
    proxima = await request.get('/correcoes/proxima')
    expect(proxima.status).toBe(404)
  }) 

  //Leitura do arquivo .json//
  it('Deveria ler o arquivo .json corretamente', async () => {

    const response = await request.get('/correcoes')
    expect(response.status).toBe(200)
  })

  it('Não deveria ocorrer erro ao abrir arquivo .json', async () => {

    const response = await request.get('/correcoes')
    expect(response.status).not.toBe(500)
  })

  it('Não deveria ocorrer nova tentativa de abrir o arquivo .json, caso ele já tenha sido aberto', async () => {

    const response = await request.get('/correcoes')
    expect(response.status).toBe(200)
  })

})


describe('Correção não Reservada', () => {
  
  //Iniciar as correções//
  it('Não deveria iniciar correção se nenhum arquivo .json tiver sido lido', async () => {

    proxima = await request.get('/correcoes/proxima/')
    expect(proxima.status).not.toBe(404)
  }) 

  it('Deveria iniciar a próxima correção', async () => {

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
    
    const salvaCorrecao = await request.post('/correcoes/9859662')
    expect(salvaCorrecao.status).toBe(200)
  })

  //Vale tanto para salvar uma correção NÃO RESERVADA quanto a RESERVADA//
  it('Não deveria salvar uma correção em que a ordem não corresponde com a regra 3 (ordem 1 -> 2 -> 3)', async () => {
    
    const salvaCorrecao = await request.post('/correcoes/9859664')
    expect(salvaCorrecao.status).toBe(404)
  })

  it("Não deveria salvar uma correção em que a 'situacao' é 'COM_DEFEITO'", async () => {
    
    const salvaCorrecao = await request.post('/correcoes/9859663')
    expect(salvaCorrecao.status).toBe(404)
  })

})


describe('Correção Reservada', () => {

  it('Não deveria iniciar correção de um item que não foi reservado', async () => {

    proximaReservada = await request.get('/correcoes/proxima/?reservada=true')
    expect(proximaReservada.status).not.toBe(200)
  }) 

  it('Deveria adicionar uma correção para a lista reservada', async () => {
      
    const AdicionaReservada = await request.post('/correcoes/reservadas/9859665')
    expect(AdicionaReservada.status).toBe(200)
  }) 
  
  it('Deveria iniciar correção de um item que não foi reservado', async () => {

    proximaReservada = await request.get('/correcoes/proxima/?reservada=true')
    expect(proximaReservada.status).toBe(200)
  }) 

  it('Não deveria adicionar uma correção que não existe para a lista reservada', async () => {
      
    const AdicionaReservada = await request.post('/correcoes/reservadas/9999999')
    expect(AdicionaReservada.status).toBe(404)
  })

  it('Deveria buscar todas as correções reservadas', async () => {

    const buscaReservada = await request.get('/correcoes/reservadas')
    expect(buscaReservada.status).toBe(200)
  })

  it('Deveria salvar uma correção reservada', async () => {
    
    const AdicionaReservada = await request.post('/correcoes/9859665')
    expect(AdicionaReservada.status).toBe(200)
  })


})




