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

// Middleware CORS para permitir requisições de diferentes origens
// Permite todas as origens (não recomendado para produção, mas útil para desenvolvimento)
app.use(cors());

// Ou permita apenas a origem do frontend (recomendado para produção)
// app.use(cors({
//     origin: 'https://to-do-list-new-one.vercel.app'
// }));

// Middleware para analisar o corpo das requisições como JSON
app.use(express.json());

// Rota para listar tarefas
app.get('/todos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todos'); // Busca todas as tarefas no banco de dados
        res.json(result.rows); // Envia as tarefas como resposta em formato JSON
    } catch (err) {
        console.error(err); // Log de erro no console
        res.status(500).send('Erro ao buscar tarefas'); // Envia resposta de erro com status 500
    }
});

// Rota para adicionar uma tarefa
app.post('/todos', async (req, res) => {
    const { task } = req.body; // Obtém a tarefa do corpo da requisição
    if (!task) {
        return res.status(400).send('Tarefa é obrigatória'); // Envia resposta de erro com status 400 se a tarefa estiver vazia
    }
    try {
        const result = await pool.query('INSERT INTO todos (task) VALUES ($1) RETURNING *', [task]); // Insere a tarefa no banco de dados
        res.json(result.rows[0]); // Envia a tarefa inserida como resposta em formato JSON
    } catch (err) {
        console.error(err); // Log de erro no console
        res.status(500).send('Erro ao adicionar tarefa'); // Envia resposta de erro com status 500
    }
});

// Rota para deletar uma tarefa
app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params; // Obtém o ID da tarefa dos parâmetros da rota
    try {
        const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]); // Deleta a tarefa do banco de dados
        if (result.rows.length === 0) {
            return res.status(404).send('Tarefa não encontrada'); // Envia resposta de erro com status 404 se a tarefa não existir
        }
        res.json(result.rows[0]); // Envia a tarefa deletada como resposta em formato JSON
    } catch (err) {
        console.error(err); // Log de erro no console
        res.status(500).send('Erro ao deletar tarefa'); // Envia resposta de erro com status 500
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`); // Log para indicar que o servidor está rodando
});