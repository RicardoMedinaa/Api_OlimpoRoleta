const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
app.use(bodyParser.json());

// Configurações do banco de dados
const pool = new Pool({
  user: 'assessorpublico',
  host: 'localhost',
  database: 'roleta',
  password: '2arquiv3',
  port: 5434, 
});

// Rota 1 - Inserir registro na tabela "Resultado"
app.post('/set_result', async (req, res) => {
  try {
    const { valor } = req.query;
    
    const dataHora = new Date().toUTCString(); // Obtém a data e hora no formato adequado

    await pool.query(
      'INSERT INTO Resultado (valor, data) VALUES ($1, $2)',
      [valor, dataHora]
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

    res.status(201).send('Token inserido com sucesso.');
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
