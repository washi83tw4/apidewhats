"use client";

import { useState, useEffect } from 'react';

export default function WhatsAppConfig() {
  const [status, setStatus] = useState('CARREGANDO');
  const [qrCode, setQrCode] = useState('');

  // Função que bate lá na nossa rota do Backend para ver se o WhatsApp tá ligado
  const checarStatus = async () => {
    try {
      // URL apontando direto para a nuvem no Render
      const resposta = await fetch('https://apidewhats.onrender.com/whatsapp/status');
      const dados = await resposta.json();
      
      setStatus(dados.status || 'DESCONECTADO');
      setQrCode(dados.qrCode || '');
    } catch (erro) {
      console.error('Erro ao buscar status do WhatsApp:', erro);
      setStatus('ERRO DE CONEXÃO');
    }
  };

  // Função nova do botão para iniciar o WhatsApp na marra
  const iniciarWhatsApp = async () => {
    setStatus('INICIANDO MOTOR...'); // Feedback visual bacana para o utilizador
    try {
      await fetch('https://apidewhats.onrender.com/whatsapp/start', {
        method: 'POST',
      });
      // Não precisamos fazer mais nada aqui, porque o 'setInterval' lá embaixo 
      // vai continuar checando a cada 3 segundos e vai atualizar o QR Code sozinho!
    } catch (erro) {
      console.error('Erro ao iniciar o WhatsApp:', erro);
      setStatus('ERRO AO INICIAR');
    }
  };

  useEffect(() => {
    // Roda a primeira vez na hora que abre a página
    checarStatus();

    // Cria um "relógio" que fica checando o status a cada 3 segundos (3000ms)
    const intervalo = setInterval(checarStatus, 3000);

    // Limpa a memória quando fecharmos a página
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Conexão WhatsApp</h1>
        
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="text-gray-600 font-semibold">Status:</span>
          <span className={`font-bold px-3 py-1 rounded-full text-sm ${
            status === 'CONECTADO' ? 'bg-green-100 text-green-700' : 
            status === 'INICIANDO MOTOR...' ? 'bg-yellow-100 text-yellow-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {status}
          </span>
        </div>

        {/* Mostra o QR Code só se ele existir e não estiver conectado */}
        {qrCode && status !== 'CONECTADO' && (
          <div className="flex justify-center mb-6 bg-white p-4 rounded-lg shadow-inner border-2 border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCode} alt="QR Code WhatsApp" className="w-64 h-64 object-contain" />
          </div>
        )}

        {status === 'CONECTADO' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700 font-medium">
              ✅ Tudo certo! O robô já está conectado e pronto para enviar mensagens automaticamente.
            </p>
          </div>
        )}

        {/* O NOVO BOTÃO AQUI */}
        <button 
          onClick={iniciarWhatsApp}
          disabled={status === 'CONECTADO'}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all active:scale-95"
        >
          {status === 'CONECTADO' ? 'WhatsApp já conectado' : 'Gerar Novo QR Code'}
        </button>
        
      </div>
    </div>
  );
}