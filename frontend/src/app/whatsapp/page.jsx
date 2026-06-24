"use client";

import { useState, useEffect } from 'react';

export default function WhatsAppConfig() {
  const [status, setStatus] = useState('CARREGANDO');
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    // Função que bate lá na nossa rota nova do Backend
    const checarStatus = async () => {
      try {
        const resposta = await fetch('https://apidewhats.onrender.com/whatsapp/status');
        const dados = await resposta.json();
        
        setStatus(dados.status);
        setQrCode(dados.qrCode);
      } catch (erro) {
        console.error('Erro ao buscar status do WhatsApp:', erro);
      }
    };

    // Roda a primeira vez na hora que abre a página
    checarStatus();

    // Cria um "relógio" que fica checando o status a cada 3 segundos (3000ms)
    const intervalo = setInterval(checarStatus, 3000);

    // Limpa a memória quando fecharmos a página
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Conexão WhatsApp</h1>

        {/* ESTADO 1: Carregando ou Iniciando */}
        {(status === 'INICIANDO' || status === 'CARREGANDO') && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Iniciando o servidor do WhatsApp...</p>
            <p className="text-sm text-gray-400 mt-2">Isso pode levar alguns segundos.</p>
          </div>
        )}

        {/* ESTADO 2: Esperando ler o QR Code */}
        {status === 'ESPERANDO_QR' && qrCode && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="bg-gray-100 p-4 rounded-xl mb-4">
              {/* Aqui é onde a mágica acontece: a tag img lê o Base64 do backend */}
              <img src={qrCode} alt="QR Code do WhatsApp" className="w-64 h-64 mx-auto" />
            </div>
            <p className="text-gray-700 font-semibold mb-2">Escaneie o QR Code</p>
            <ol className="text-sm text-gray-500 text-left list-decimal list-inside">
              <li>Abra o WhatsApp no seu celular</li>
              <li>Vá em Configurações &gt; Aparelhos Conectados</li>
              <li>Aponte a câmera para a tela</li>
            </ol>
          </div>
        )}

        {/* ESTADO 3: Conectado com Sucesso */}
        {status === 'CONECTADO' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-green-700 font-bold text-lg mb-2">WhatsApp Conectado!</p>
            <p className="text-sm text-gray-600">O sistema está pronto para realizar os disparos automáticos de CRM.</p>
          </div>
        )}
      </div>
    </div>
  );
}