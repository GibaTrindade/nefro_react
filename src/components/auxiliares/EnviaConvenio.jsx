import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Supondo que você tenha uma configuração do Firebase

const EnviaConvenio = () => {
  const [nomeConvenio, setNomeConvenio] = useState('');

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {

  //     await addDoc(collection(db, "convenios"), { nome: nomeConvenio });
  //     setNomeConvenio(''); // Limpar o campo após o envio
  //     // Adicione qualquer lógica adicional após o envio, como mostrar uma mensagem de sucesso
  //   } catch (error) {
  //     console.error("Erro ao adicionar convenio:", error);
  //     // Adicione qualquer lógica de tratamento de erro, como mostrar uma mensagem de erro
  //   }
  // };
  const convenios = [
  'ABET',
  'ALLIANZ SAÚDE',
  'AMEPE CAMPE',
  'AMIL',
  'ASSEFAZ',
  'BANCO CENTRAL',
  'BNDES - FAPES',
  'BRADESCO',
  'CAMED SAÚDE',
  'CAMED VIDA',
  'CAPESAUDE/CAPESESP',
  'CARE PLUS',
  'CASSI/BANCO DO BRASIL',
  'COMPESA SAÚDE',
  'CONAB',
  'EAS SAÚDE',
  'EMBRATEL',
  'ESTALEIRO ATLÂNTICO SUL S/A',
  'FUSEX/EXÉRCITO',
  'FACHESF',
  'FASSINCRA',
  'FIOPREV',
  'FISCO SAÚDE',
  'FUNCEF - CAIXA',
  'FUNDAÇÃO FIAT',
  'GAMA SAÚDE',
  'GEAP',
  'GOLDEN CROSS',
  'HAPVIDA',
  'HOSPITAL AERONÁUTICA',
  'INFRAERO',
  'IPSEP/SASSEPE',
  'JOSAPAR SAÚDE',
  'LIFE EMPRESARIA',
  'MAPFRE SAÚDE',
  'MEDIAL',
  'MEDISERVICE',
  'NAVAL/MARINHA',
  'NORCLINICAS',
  'NOTRE DAME',
  'PETROBRÁS DISTR',
  'PETROBRÁS PETRO',
  'PLAN ASSIST MPF',
  'PLAN ASSIST TRAB',
  'PLAN ASSIST MILIT',
  'POLÍCIA MILITAR',
  'POSTAL SAÚDE/CORREIOS',
  'PORTO SEGURO',
  'FUNCEF/SAÚDE CAIXA',
  'SAÚDE RECIFE',
  'SAÚDE EXCELSIOR',
  'SEGURADORAS INT',
  'SERPRO',
  'SUL AMÉRICA',
  'TEMPO SAÚDE',
  'UNAFISCO SAÚDE',
  'UNIMED RECIFE',
  'UNIMED INTERCÂMBIO',
  'VALE RIO DOCE',
  'VERITAS',
  'PARTICULAR',
  'SUS',
  'OUTROS'
]

const adicionaTodosConvenios = async (e) => {
  e.preventDefault();
  try {
    for (const nomeConvenio of convenios) {
      await addDoc(collection(db, "convenios"), { nome: nomeConvenio });
    }
    console.log('Todos os convênios foram adicionados com sucesso.');
    // Você pode adicionar aqui qualquer lógica adicional após a adição bem-sucedida
  } catch (error) {
    console.error("Erro ao adicionar convênios:", error);
    // Adicione qualquer lógica de tratamento de erro
  }
};

  return (
    <div>
      {/* Outros elementos do dashboard */}
      <form onSubmit={adicionaTodosConvenios}>
        <input 
          type="text" 
          value={nomeConvenio} 
          onChange={(e) => setNomeConvenio(e.target.value)} 
          placeholder="Nome do Convenio" 
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
};

export default EnviaConvenio;