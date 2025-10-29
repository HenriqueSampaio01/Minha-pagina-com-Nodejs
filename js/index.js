const express = require('express')
const app = express()
const cors = require('cors');
const bodyParser= require('body-parser');
const md5 = require('md5');
const multer = require('multer');
const upload = multer();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())

const connection = require('./conexaobd');
const autenticacao = require('./autenticacaoJwt.js');

app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'] }));


app.get('/', function (req, res) {
    res.send('Olá! Seja bem vindo à nossa API')
})

//autenticacao.verificaTokenJwt

app.get('/cadastro', autenticacao.verificaTokenJwt, async function (req, res) {
    try{
       const [usuarios] = await connection.execute(` SELECT * FROM cadastro ` );
       res.status(200).send(usuarios)
    }
    catch(erro){
        res.status(500).json({ "mensagem": "Ocorreu um erro na API, tente mais tarde." }) 
    }     
})

app.get('/cadastro/:id', async function (req, res) {
    const id = req.params.id;

    try {
        const [results] = await connection.execute('SELECT * FROM cadastro WHERE id = ?', [id]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.json(results[0]); // Retorna o primeiro usuário encontrado
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});


app.post('/cadastro', upload.none(), async function (req, res) {
    try {
        const { nome, email, password } = req.body;
        console.log('Body',req.body)
        // Verificação de campos obrigatórios
        if (!nome || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Nome, email e senha devem ser informados."
            });
        }

        // Gerar hash MD5 da senha
        const senhaHash = md5(password);

        // Query parametrizada para evitar SQL Injection
        const query = `
            INSERT INTO cadastro (nome, email, senha)
            VALUES (?, ?, ?)
        `;

        const [resultado] = await connection.execute(query, [nome, email, senhaHash]);

        if (resultado.affectedRows > 0) {
            return res.status(201).json({
                success: true,
                message: "Usuário cadastrado com sucesso."
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Ocorreu um erro ao realizar o cadastro. Informe a equipe de suporte."
            });
        }

    } catch (erro) {
        console.error("Erro ao cadastrar usuário:", erro);
        return res.status(500).json({
            success: false,
            message: "Ocorreu um erro interno na API. Tente novamente mais tarde."
        });
    }
});


app.put('/cadastro/:id', upload.none() ,async function (req, res) {
    try {
        const { id } = req.params;
        const { nome, email, password } = req.body;

        // Verifica se o ID é válido
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: "ID de usuário inválido."
            });
        }

        // Monta dinamicamente os campos a atualizar
        const campos = [];
        const valores = [];

        if (nome) {
            campos.push("nome = ?");
            valores.push(nome);
        }

        if (email) {
            campos.push("email = ?");
            valores.push(email);
        }

        if (password) {
            const senhaHash = md5(password);
            campos.push("senha = ?");
            valores.push(senhaHash);
        }

        if (campos.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Nenhum campo foi informado para atualização."
            });
        }

        valores.push(id); // ID do usuário no final

        const query = `
            UPDATE cadastro
            SET ${campos.join(', ')}
            WHERE id = ?
        `;

        const [resultado] = await connection.execute(query, valores);

        if (resultado.affectedRows > 0) {
            return res.status(200).json({
                success: true,
                message: "Usuário atualizado com sucesso."
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado."
            });
        }

    } catch (erro) {
        console.error("Erro ao atualizar usuário:", erro);
        return res.status(500).json({
            success: false,
            message: "Erro interno ao tentar atualizar o usuário."
        });
    }
});


app.delete('/cadastro/:id', async function (req, res) {
    try {
        const { id } = req.params;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: "ID de usuário inválido."
            });
        }

        // Verifica se o usuário existe
        const [verifica] = await connection.execute(
            "SELECT id FROM cadastro WHERE id = ?",
            [id]
        );

        if (verifica.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado."
            });
        }

        // Deleta o usuário
        const [resultado] = await connection.execute(
            "DELETE FROM cadastro WHERE id = ?",
            [id]
        );

        if (resultado.affectedRows > 0) {
            // Ou retorna 204 sem resposta textual
            return res.status(200).json({
                success: true,
                message: "Usuário excluído com sucesso."
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Erro ao tentar excluir o usuário. Tente novamente."
            });
        }

    } catch (erro) {
        console.error("Erro ao excluir usuário:", erro);
        return res.status(500).json({
            success: false,
            message: "Erro interno ao tentar excluir o usuário."
        });
    }
});



app.post('/cadastro-autenticar', upload.none(), async function (req, res) { 
    console.log(req.body)
    const name = req.body.nome;
    const senhaHash = md5(req.body.password);
    var query = `SELECT * FROM cadastro WHERE nome = ? AND senha = ? `
    var [resultado] = await connection.execute(query,[name,senhaHash]);
    console.log(resultado)
    if (resultado.length > 0){
        token = await autenticacao.gerarTokenJwt(resultado[0].id)
        res.status(200).json({ 
                                "success": true,
                                "nome": resultado[0].nome,
                                "email": resultado[0].email,
                                "tokenAcesso": token
                            })
    }else{
        res.status(401).json({ 
            "success": false,
            "message": "Usuário ou Senha inválidos"
        })  
    }
    
})

app.listen(3000, () => {
	console.log('API On-line!');
});


