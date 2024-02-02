import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Supondo que você tenha uma configuração do Firebase

const EnviaAcesso = () => {
  const [nomeAcesso, setNomeAcesso] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "acessos"), { nome: nomeAcesso });
      setNomeAcesso(''); // Limpar o campo após o envio
      // Adicione qualquer lógica adicional após o envio, como mostrar uma mensagem de sucesso
    } catch (error) {
      console.error("Erro ao adicionar acesso:", error);
      // Adicione qualquer lógica de tratamento de erro, como mostrar uma mensagem de erro
    }
  };

  return (
    <div>
      {/* Outros elementos do dashboard */}
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={nomeAcesso} 
          onChange={(e) => setNomeAcesso(e.target.value)} 
          placeholder="Nome do Acesso" 
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
};

export default EnviaAcesso;