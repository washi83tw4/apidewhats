'use client'; 

import { useState, useEffect } from 'react';

export default function Home() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null); 
  const [novoCliente, setNovoCliente] = useState({
    nome: '', email: '', telefone: '', empresa: ''
  });

  const buscarClientes = async () => {
    try {
      const resposta = await fetch('https://apidewhats.onrender.com/clientes');
      const dados = await resposta.json();
      setClientes(dados);
      setCarregando(false);
    } catch (erro) {
      console.error('Erro ao buscar clientes:', erro);
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarClientes();
  }, []);

  const salvarCliente = async (e) => {
    e.preventDefault(); 
    try {
      const url = editandoId ? `https://apidewhats.onrender.com/clientes/${editandoId}` : 'https://apidewhats.onrender.com/clientes';
      const metodo = editandoId ? 'PUT' : 'POST';

      const resposta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoCliente)
      });

      if (resposta.ok) {
        fecharFormulario();
        buscarClientes(); 
      }
    } catch (erro) {
      console.error('Erro ao salvar cliente:', erro);
    }
  };

  const excluirCliente = async (id) => {
    if (!window.confirm("Tem a certeza que deseja excluir este cliente?")) return;
    
    try {
      const resposta = await fetch(`https://apidewhats.onrender.com/clientes/${id}`, {
        method: 'DELETE'
      });
      if (resposta.ok) buscarClientes();
    } catch (erro) {
      console.error('Erro ao excluir:', erro);
    }
  };

  const prepararEdicao = (cliente) => {
    setNovoCliente({
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      empresa: cliente.empresa || ''
    });
    setEditandoId(cliente.id);
    setMostrarFormulario(true);
  };

  const fecharFormulario = () => {
    setMostrarFormulario(false);
    setEditandoId(null);
    setNovoCliente({ nome: '', email: '', telefone: '', empresa: '' });
  };

  // Mantemos o botão manual do WhatsApp caso queira iniciar uma conversa sem mudar o status
  const abrirWhatsApp = (telefone, nome) => {
    if (!telefone) return alert("Cliente sem telefone.");
    let numeroLimpo = telefone.replace(/\D/g, '');
    if (numeroLimpo.length === 10 || numeroLimpo.length === 11) numeroLimpo = '55' + numeroLimpo;
    const mensagem = encodeURIComponent(`Olá ${nome}, tudo bem? Aqui é da Tech Solutions.`);
    window.open(`https://wa.me/${numeroLimpo}?text=${mensagem}`, '_blank');
  };

  // ==========================================
  // FUNÇÃO ATUALIZADA: Mudar Status (Limpa)
  // ==========================================
  const mudarStatus = async (cliente, novoStatus) => {
    try {
      // Avisa o backend para atualizar o status e disparar a automação invisível
      const resposta = await fetch(`https://apidewhats.onrender.com/clientes/${cliente.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });

      if (resposta.ok) {
        // Apenas atualiza a tabela no ecrã. O envio da mensagem acontece no Backend!
        buscarClientes(); 
      }
    } catch (erro) {
      console.error('Erro ao mudar status:', erro);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">CRM WhatsApp</h1>
            <p className="text-gray-400 text-sm">Gestão de clientes e automação</p>
          </div>
          <button 
            onClick={() => mostrarFormulario ? fecharFormulario() : setMostrarFormulario(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {mostrarFormulario ? 'Cancelar' : '+ Novo Cliente'}
          </button>
        </header>

        {mostrarFormulario && (
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {editandoId ? 'Editar Cliente' : 'Registar Novo Cliente'}
            </h2>
            <form onSubmit={salvarCliente} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Nome completo" required className="bg-gray-700 border border-gray-600 rounded p-2 text-white outline-none focus:border-indigo-500" value={novoCliente.nome} onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })} />
              <input type="email" placeholder="E-mail" className="bg-gray-700 border border-gray-600 rounded p-2 text-white outline-none focus:border-indigo-500" value={novoCliente.email} onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })} />
              <input type="text" placeholder="Telefone" required className="bg-gray-700 border border-gray-600 rounded p-2 text-white outline-none focus:border-indigo-500" value={novoCliente.telefone} onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })} />
              <input type="text" placeholder="Empresa" className="bg-gray-700 border border-gray-600 rounded p-2 text-white outline-none focus:border-indigo-500" value={novoCliente.empresa} onChange={(e) => setNovoCliente({ ...novoCliente, empresa: e.target.value })} />
              <div className="md:col-span-2 flex justify-end mt-2">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  {editandoId ? 'Atualizar Cliente' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
          {carregando ? (
            <div className="p-8 text-center text-gray-400">A carregar clientes...</div>
          ) : clientes.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Nenhum cliente registado no momento.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-750 text-gray-300 font-semibold text-sm border-b border-gray-700">
                  <th className="p-4">Nome</th>
                  <th className="p-4">Empresa</th>
                  <th className="p-4">Telefone</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-750 transition-colors">
                    <td className="p-4 font-medium text-white">{cliente.nome}</td>
                    <td className="p-4 text-gray-300">{cliente.empresa || '---'}</td>
                    <td className="p-4 text-gray-300">{cliente.telefone || '---'}</td>
                    <td className="p-4">
                      <select
                        value={cliente.status}
                        onChange={(e) => mudarStatus(cliente, e.target.value)}
                        className="bg-gray-700 border border-gray-600 text-indigo-300 text-sm rounded focus:ring-indigo-500 focus:border-indigo-500 block p-1.5 outline-none cursor-pointer"
                      >
                        <option value="Novo">Novo</option>
                        <option value="Em negociação">Em negociação</option>
                        <option value="Fechado">Fechado</option>
                        <option value="Perdido">Perdido</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => abrirWhatsApp(cliente.telefone, cliente.nome)} className="text-sm bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white px-3 py-1 rounded transition-colors mr-3">WhatsApp</button>
                      <button onClick={() => prepararEdicao(cliente)} className="text-sm text-gray-400 hover:text-white mr-3">Editar</button>
                      <button onClick={() => excluirCliente(cliente.id)} className="text-sm text-rose-400 hover:text-rose-300">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}