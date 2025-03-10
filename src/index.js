const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// Configuração do banco de dados
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Usa a variável de ambiente DATABASE_URL
    ssl: {
        rejectUnauthorized: false
    }
});

// Seu código para rotas e operações de banco de dados...

app.use(cors());
app.use(express.json());

// Rota para listar tarefas
app.get('/todos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todos');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar tarefas');
    }
});

// Rota para adicionar uma tarefa
app.post('/todos', async (req, res) => {
    const { task } = req.body;
    if (!task) {
        return res.status(400).send('Tarefa é obrigatória');
    }
    try {
        const result = await pool.query('INSERT INTO todos (task) VALUES ($1) RETURNING *', [task]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao adicionar tarefa');
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});