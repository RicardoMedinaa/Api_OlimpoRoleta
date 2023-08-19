const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const moment = require('moment-timezone');

require('dotenv').config()

const app = express();
app.use(bodyParser.json());

const pool = new Pool({
  user     : process.env.DB_USERNAME,
  host     : process.env.DB_HOSTNAME,
  database : process.env.DB_NAME,
  password : process.env.DB_PASSWORD,
  port     : process.env.DB_PORT
});

pool.connect(function(err) {
  if (err) {
    console.error('Error. Database connection failed: ' + err.stack);
    return;
  }

  console.log('Connected to database.');
});

//pool.end();

// Rota 1 - Inserir registro na tabela "Resultado"
app.post('/set_result', async (req, res) => {
  try {
    const { valor, aposta, gale } = req.query;
    const dataHora = moment.tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');

    await pool.query(
      'INSERT INTO Resultado (valor, aposta, gale, data) VALUES ($1, $2, $3, $4)',
      [valor, aposta, gale, dataHora]
    );

    res.status(201).send('Registro inserido com sucesso.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao inserir registro.');
  }
});

// Rota 2 - Inserir registro na tabela "Licenca"
app.post('/set_licenca', async (req, res) => {
  try {
    const { token } = req.query;

    await pool.query('INSERT INTO Licenca (token) VALUES ($1)', [token]);

    res.status(201).send('Token inserido com sucesso');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao inserir token.');
  }
});

// Rota 3 - Obter último valor inserido na tabela "Resultado" com base no token
app.get('/get_result', async (req, res) => {
    try {
      const { token } = req.query;

      if (!token) {
        res.status(400).send('Token não fornecido.');
        return;
      }
  
      const tokenResult = await pool.query('SELECT * FROM licenca WHERE token = $1', [token]);
  
      if (tokenResult.rows.length === 0) {
        res.status(404).send('Token não encontrado.');
        return;
      }
  
      const result = await pool.query(
        'SELECT * FROM resultado order by resultadoid desc limit 1'
      );
  
      if (result.rows.length === 0) {
        res.status(404).send('Nenhum registro encontrado.');
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar valor.');
    }
  });
  

// Rota 4 - Deletar registro na tabela "Licenca" com base no token
app.delete('/del_licenca', async (req, res) => {
  try {
    const { token } = req.query;

    await pool.query('DELETE FROM Licenca WHERE token = $1', [token]);

    res.status(200).send('Token deletado com sucesso.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao deletar token.');
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
