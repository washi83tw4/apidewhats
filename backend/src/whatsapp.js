const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal'); // Mantemos para você ver no terminal também
const qrcode = require('qrcode'); // Nova biblioteca de imagem

console.log("⏳ Inicializando módulo do WhatsApp...");

// Variáveis globais para o Frontend ler
let statusWhatsApp = 'INICIANDO'; // Pode ser: 'INICIANDO', 'ESPERANDO_QR', 'CONECTADO'
let qrCodeImage = ''; 

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './sessao_whatsapp'
    }),
    puppeteer: {
        handleSIGINT: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('qr', async (qr) => {
    console.log('⚡ QR CODE GERADO! Disponível no terminal e no frontend.');
    qrcodeTerminal.generate(qr, { small: true });
    
    // Transforma o texto do QR Code numa imagem Base64
    qrCodeImage = await qrcode.toDataURL(qr);
    statusWhatsApp = 'ESPERANDO_QR';
});

client.on('ready', () => {
    console.log('🚀 WhatsApp conectado e pronto para enviar mensagens automáticas!');
    statusWhatsApp = 'CONECTADO';
    qrCodeImage = ''; // Limpa a imagem porque já conectou
});

client.initialize();

// ... (A função enviarMensagemInvisivel que já estava aqui continua igual) ...
const enviarMensagemInvisivel = async (telefone, texto) => {
    try {
        let numeroLimpo = telefone.replace(/\D/g, '');
        if (numeroLimpo.length === 10 || numeroLimpo.length === 11) {
            numeroLimpo = '55' + numeroLimpo;
        }

        const contato = await client.getNumberId(numeroLimpo);

        if (!contato) {
            console.log(`⚠️ AVISO: O número ${numeroLimpo} não foi encontrado no WhatsApp.`);
            return; 
        }

        await client.sendMessage(contato._serialized, texto);
        console.log(`✅ Mensagem enviada com sucesso para ${numeroLimpo}`);
        
    } catch (erro) {
        console.error(`❌ Erro interno ao enviar mensagem:`, erro.message);
    }
};

// Nova função que exportamos para o server.js
const obterStatusWhatsApp = () => {
    return {
        status: statusWhatsApp,
        qrCode: qrCodeImage
    };
};

module.exports = { enviarMensagemInvisivel, obterStatusWhatsApp };