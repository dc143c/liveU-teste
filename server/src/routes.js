const express = require('express');
const executeSQL = require('./database/index');
const bodyParser = require('body-parser');

//Importando Axios e QS para fazer o envio do formulário à API.
const axios = require('axios');
const qs = require('qs');

const routes = express.Router();

const urlEncodedParser = bodyParser.urlencoded({extended: false});

routes.get('/', function(req,res) {
    res.render("home");
})

routes.get('/register', (req,res) => {
    res.render("register");
})

routes.post('/register', urlEncodedParser, async (req,res) => {
    const { nome, sobrenome, email } = req.body;
    const data = qs.stringify({
        nome: nome,
        sobrenome: sobrenome,
        email: email
    })
    const response = await axios.post('http://138.68.29.250:8082', data, 
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        }
    );

    const respLine = response.data;
    const respSplit = respLine.split('#');
    const codes = {
        nome: respSplit[1],
        sobrenome: respSplit[3],
        email: respSplit[5]
    }

    await executeSQL(`INSERT INTO tbs_nome (nome, cod) VALUES ('${nome}', '${codes.nome}');
                INSERT INTO tbs_sobrenome (sobrenome, cod) VALUES ('${sobrenome}', '${codes.sobrenome}');
                INSERT INTO tbs_email (email, cod) VALUES ('${email}', '${codes.email}');`,
        (err, rows) => {
        if(!!err) {
            console.log(err);
        }
        console.log('Dados enviados com sucesso!')
    })
    let search = setTimeout(async() => {
    await executeSQL(`SELECT * FROM tbs_cod_nome WHERE cod=${codes.nome};
        SELECT * FROM tbs_cod_sobrenome WHERE cod=${codes.sobrenome};
        SELECT * FROM tbs_cod_email WHERE cod=${codes.email};`,
        async (err, {rowCount, rows}) => {
            if(err) {
                console.log(err);
            }     
            const datas = rows;
            let total = 0;
            console.log('Conjunto de números obtido! Fazendo soma...');
            datas.forEach(element => {
                total += parseInt(element[1].value) + parseInt(element[2].value)
            });
            console.log('Valor da soma obtido com sucesso! Sua soma é: ', total);

            //Select nas tabelas de ref com JOIN
            //Deletar a tabela de cores_excluidas com LEFT JOIN

            await executeSQL(`SELECT * FROM tbs_animais WHERE total=${total};
            SELECT * FROM tbs_paises WHERE total=${total};
            SELECT a.cor, b.cor, a.total FROM tbs_cores AS a LEFT JOIN tbs_cores_excluidas AS b ON a.cor = b.cor WHERE b.cor is null AND a.total=${total};
            `, 
                (err, {rowCount, rows}) => {
                if(err) {
                    console.log(err); 
                }
                console.log('Obtendo animal, país e cores com a soma obtida...', rows)
                const arr = []
                rows.forEach(element => {
                    if(element[1]['value'] == null) {
                        console.log('Esse elemento foi desconsiderado por ser nulo!')
                    } else {
                        arr.push(element[1]['value']);
                    }
                    if((typeof element[0]['value']) == 'number') {
                        console.log('Esse elemento foi desconsiderado por ser um número!')
                    } else {
                        arr.push(element[0]['value'])
                    }
                })
                console.log(arr);
                console.log('Dados recebidos com sucesso! Você pode verificar os dados em sua view.')
                res.render('user', {nome: nome, sobrenome: sobrenome, email: email, object: arr})
                
            });
    })
    }, 1500)
})

module.exports = routes;