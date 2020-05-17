Leia-me

Aplicação feita conforme a descrição do documento enviado, "Prova Prática Edital Nº 003_2020.pdf".

- O sistema operacional utilizado foi o Xubuntu 18.04 LTS
- Aplicação foi desenvolvida em NodeJS (versão 13.12.0), com alguns pacotes que serão detalhados a seguir.
- Foi utilizado o framework Express JS.
- Foi utilizado o framework Jest para os testes unitários, juntamente com o pacote do supertest.
- O editor de texto utilizado foi VS Code.

- Foi usado o npm (versão 6.14.4) como gerenciador de pacotes do NodeJS.
- Com o diretório base chamado de "webapi", foram criados dois arquivos (app.js, server.js) e uma pasta chamada "files" em que dentro dela está localizado os arquivos de leitura .json.

- Após foi executado pelo terminal dentro da pasta:
	- npm init
	- npm install express --save

	- Depois foi executado o comando "node server " para startar a aplicação na porta 3000. 
		Com isso basta acessar por um browser o endereço  http://localhost:3000/  ou  http://localhost:3000/correcoes
		
	- Foi utlizado o software Postman para testar as requests, responses. Como também o acesso aos endpoints solicitados na descrição da tarefa.
		
	
	Para os testes manuais no Postman foram seguidas as regras descritas na descrição da tarefa como também alguns casos que podem acontecer.
	
		Após startar a api, é necessário acessar pelo metódo get o endereço http://localhost:3000/correcoes e esse endpoint irá ler o arquivo .json.
		A partir disso a api irá dar como response uma mensagem informando que foi feita a leitura com sucesso.
		
		Próximo passo é verificar qual a próxima correção dispoível pelo metódo get o endereço http://localhost:3000/correcoes/proxima que irá retornar
		a próxima correção, se ela estiver disponível para correção, o campo "situacao" está com o valor "SUCESSO".
		
		A partir daqui poderá prosseguir para a próxima correção disponível ou então salvar a correção desejada.
			Para salvar a correção desejada, basta acessar pelo metódo post o endereço http://localhost:3000/correcoes/999999 onde o "99999" representa o ID do item
			que deseja salvar desde que a situação dele seja "SUCESSO" ou "RESERVADA". Passando um json com o seguinte formato no body da aplicação:
				{
				 "chave": [{
					 "id": 186,
					 "valor": "0"
					}]
				}
			
				Caso o item seja salvo corretamente aparecerá uma mensagem informando que o foi salvo com sucesso.
				Caso o item esteja com diferença entre id e valor, será exibida uma mensagem de erro.
				Caso o item não respeita a regra 3 da descrição da tarefa. Então será exibida uma mensagem de erro e a correção não será salva.
				Caso o item já tenha sido corrigido, então será exida uma mensagem informando que foi foi corrigido.
				Existem mais alguns casos que a api cobre, como por exemplo, se o usuário tentar salvar um item com ID que não existe no arquivo que foi lido, nesse caso ele vai informar que o ID não existe.
			
			Para reservar um item basta acessar pelo metódo post o endereço http://localhost:3000/correcoes/reservadas/999999 onde o "999999" é o ID do item que se deseja reservar.
			Para verificar a lista de itens que já foram reservados basta acessar pelo metódo get o endpoint http://localhost:3000/correcoes/reservadas
			Para buscar a próxima correção reservada basta acessar o endpoint pelo metódo get http://localhost:3000/correcoes/proxima/?reservada=true que trará a próxima correção reservada caso existe, se não existe será exibida uma mensagem informando que não tem.
			Para salvar uma correção reservada é a mesma maneira de salvar uma correção não reservada. Caso todas as correções não reservadas sejam salvas, então as próximas serão as reservadas.

	
	Para os testes unitários foi utilizado o Jest. Para isso foi criada a pasta "__tests__" e dentro dela uma outra pasta com o nome de "unit" que é o local onde o arquivo de teste ficará.
	O arquivo contendo os testes unitários (app.test.js) tem que estar dentro da pasta "unit".
	
		A instalação do pacote:
			- npm i jest
			- npm install supertest --save-dev
			
			Após instalar bastar ir no arquivo package.json e onde está com "test": "Alguma informação" alterar para "test": "jest" ou "test": "jest --coverage" caso queira ver a porcentagem do código que foi coberto pelos testes.
			
			Para os testes unitários foram criados os que cobrem as principais partes da aplicação. 
			Para iniciar os testes unitários, bastar estar dentro da pasta da api, no caso é a pasta webapi e executar o comando: 
				- npm test
			
			Fazendo isso ele exibirá os resultados. Foi enviado juntamente com o projeto um print após a realização dos testes unitários.
		





