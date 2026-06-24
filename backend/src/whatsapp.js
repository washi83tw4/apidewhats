const { Client, LocalAuth } = require('whatsapp-web.js');

// Variáveis na memória para guardar o que está acontecendo
let statusWhatsApp = 'DESCONECTADO';
let qrCodeAtual = '';

// Configuração do WhatsApp com o Puppeteer em modo "Dieta Extrema" para o Render
const client = new Client({
    authStrategy: new LocalAuth(), // Salva a sessão para não ter que ler o QR Code toda vez
    puppeteer: {
        headless: true, // Roda invisível no servidor
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ] // Essas linhas garantem que o Chrome gaste pouquíssima memória RAM!
    }
});

// Evento: Quando o robô pede o QR Code
client.on('qr', (qr) => {
    console.log('✅ Novo QR Code gerado nos bastidores!');
    statusWhatsApp = 'AGUARDANDO_QR';
    
    // Transforma o código num link de imagem para o frontend ler facilmente
    qrCodeAtual = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qr)}`;
});

// Evento: Quando o WhatsApp conecta com sucesso
client.on('ready', () => {
    console.log('🚀 Motor do WhatsApp conectado e pronto para uso!');
    statusWhatsApp = 'CONECTADO';
    qrCodeAtual = ''; // Limpa o QR Code pois já conectou
});

// Evento: Se o celular for desconectado ou a internet cair
client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp Desconectado:', reason);
    statusWhatsApp = 'DESCONECTADO';
    qrCodeAtual = '';
});

// ==========================================
// FUNÇÕES QUE O SERVER.JS VAI USAR
// ==========================================

// 1. Função para dar a partida no motor (o nosso botão verde da tela vai chamar ela)
const iniciarWhatsApp = () => {
    if (statusWhatsApp === 'DESCONECTADO' || statusWhatsApp === 'ERRO') {
        console.log('Dando a partida no Puppeteer...');
        statusWhatsApp = 'INICIANDO MOTOR...';
        
        client.initialize().catch(err => {
            console.error('Erro forte ao iniciar o bot:', err);
            statusWhatsApp = 'ERRO';
        });
    } else {
        console.log('O motor já está ligado ou carregando!');
    }
};

// 2. Função para o frontend saber como estão as coisas
const obterStatusWhatsApp = () => {
    return {
        status: statusWhatsApp,
        qrCode: qrCodeAtual
    };
};

// 3. Função para mandar mensagens automáticas lá na tela de Clientes
const enviarMensagemInvisivel = async (telefone, mensagem) => {
    if (statusWhatsApp !== 'CONECTADO') {
        console.log('Aviso: Tentou enviar mensagem, mas o WhatsApp não está conectado.');
        return false;
    }

    try {
        // Limpa o telefone deixando só os números e coloca no formato padrão brasileiro
        // Exemplo: 55 + DDD + Numero + @c.us
        const apenasNumeros = telefone.replace(/\D/g, '');
        const numeroFormatado = `55${apenasNumeros}@c.us`;
        
        await client.sendMessage(numeroFormatado, mensagem);
        console.log(`Mensagem enviada com sucesso para o número: ${telefone}`);
        return true;
    } catch (error) {
        console.error('Falha ao enviar mensagem pelo bot:', error);
        return false;
    }
};

module.exports = {
    iniciarWhatsApp,
    obterStatusWhatsApp,
    enviarMensagemInvisivel
};