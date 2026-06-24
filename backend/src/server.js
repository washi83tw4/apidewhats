const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log("🚀 1. Iniciando o servidor...");

// Importamos o cliente do Supabase e as funções do WhatsApp
// (Se precisares de chamar a função que inicia o bot, lembra-te de a exportar no whatsapp.js e importá-la aqui)
const supabase = require('./supabase');
const { enviarMensagemInvisivel, obterStatusWhatsApp } = require('./whatsapp');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ "mensagem": "API CRM com Supabase funcionando!" });
});

// ==========================================
// ROTAS DO WHATSAPP
// ==========================================

// Rota para ler o status e o QR Code
app.get('/whatsapp/status', (req, res) => {
  const statusAtual = obterStatusWhatsApp();
  res.json(statusAtual);
});

// NOVA ROTA: Botão para iniciar o WhatsApp manualmente
app.post('/whatsapp/start', (req, res) => {
    try {
        console.log('Comando recebido: Iniciando o WhatsApp...');
        
        // Aqui chamamos a função que liga o bot do WhatsApp. 
        // Substitui "client.initialize()" pela função correta caso tenhas dado outro nome no teu whatsapp.js
        // client.initialize(); 
        
        res.status(200).json({ success: true, message: 'Processo de inicialização do WhatsApp começou!' });
    } catch (error) {
        console.error('Erro ao dar a partida no WhatsApp:', error);
        res.status(500).json({ success: false, error: 'Erro ao ligar o bot.' });
    }
});

// ==========================================
// ROTAS DOS CLIENTES (CRM)
// ==========================================

// 1. Rota para LISTAR todos os clientes (GET)
app.get('/clientes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('id', { ascending: true }); // Ordena pelo ID

    if (error) throw error;
    res.json(data);
  } catch (erro) {
    console.error('Erro ao buscar clientes no Supabase:', erro.message);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});

// 2. Rota para CRIAR um novo cliente (POST)
app.post('/clientes', async (req, res) => {
  try {
    const { nome, email, telefone, empresa } = req.body;

    const { data, error } = await supabase
      .from('clientes')
      .insert([{ nome, email, telefone, empresa }])
      .select(); // Força o Supabase a retornar o cliente criado

    if (error) throw error;
    res.status(201).json({ mensagem: 'Cliente criado com sucesso!', id: data[0].id });
  } catch (erro) {
    console.error('Erro ao criar cliente:', erro.message);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});

// 3. Rota para EDITAR um cliente inteiro (PUT)
app.put('/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, empresa } = req.body;

    const { error } = await supabase
      .from('clientes')
      .update({ nome, email, telefone, empresa })
      .eq('id', id);

    if (error) throw error;
    res.json({ mensagem: 'Cliente atualizado com sucesso!' });
  } catch (erro) {
    console.error('Erro ao editar cliente:', erro.message);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});

// 4. Rota para MUDAR STATUS do cliente (PATCH) + AUTOMAÇÃO
app.patch('/clientes/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // 1. Atualiza o status no Supabase
    const { data, error } = await supabase
      .from('clientes')
      .update({ status })
      .eq('id', id)
      .select(); 

    if (error) throw error;
    if (data.length === 0) return res.status(404).json({ mensagem: 'Cliente não encontrado' });
    
    const cliente = data[0];
    res.json({ mensagem: 'Status atualizado com sucesso!' });

    // 2. Dispara a nossa automação invisível do WhatsApp
    let mensagemAutomacao = '';
    if (status === 'Em negociação') {
      mensagemAutomacao = `Olá ${cliente.nome}, vimos que você está interessado! Como podemos ajudar a fechar negócio com a ${cliente.empresa || 'sua empresa'}?`;
    } else if (status === 'Fechado') {
      mensagemAutomacao = `Parabéns ${cliente.nome}! Ficamos muito felizes em fechar essa parceria. Seja bem-vindo! 🚀`;
    } else if (status === 'Perdido') {
      mensagemAutomacao = `Poxa ${cliente.nome}, que pena que não deu certo desta vez. Estamos à disposição para o futuro!`;
    }

    if (mensagemAutomacao && cliente.telefone) {
        console.log(`🤖 Automação disparada via Supabase para status: [${status}]...`);
        await enviarMensagemInvisivel(cliente.telefone, mensagemAutomacao);
    }

  } catch (erro) {
    console.error('Erro ao mudar status:', erro.message);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});

// 5. Rota para EXCLUIR um cliente (DELETE)
app.delete('/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ mensagem: 'Cliente excluído com sucesso!' });
  } catch (erro) {
    console.error('Erro ao excluir cliente:', erro.message);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando perfeitamente na porta ${PORT}`);
});