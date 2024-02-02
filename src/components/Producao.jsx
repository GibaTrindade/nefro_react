import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

function getDaysInMonth(month, year) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = [];

  for (let day = 1; day <= daysInMonth; day++) {
    daysArray.push(new Date(year, month - 1, day));
  }

  return daysArray;
}

function Producao({pacientes}) {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [daysOfMonth, setDaysOfMonth] = useState([]);
  const [valores, setValores] = useState([]);
  const [totalMensal, setTotalMensal] = useState(0);
  //const [valor, setValor] = useState(0);
  //let valor = 0

  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = selectedMonth//currentDate.getMonth() + 1; // Mês atual
    const currentYear = currentDate.getFullYear();
    const daysArray = getDaysInMonth(currentMonth, currentYear);
    //setDaysOfMonth(daysArray);
    //setSelectedMonth(currentMonth.toString()); // Defina o mês selecionado como o mês atual

    // Calcular os valores aqui com base nos dias do mês e atualizar o estado
    const calculatedValores = daysArray.map((day) => {
        const countParecerVisita = countProducoesComNomes(
          format(day, 'yyyy-MM-dd'),
          ['PARECER', 'VISITA']
        ) * 70;
        const countCateter = countProducoesComCateter(
            format(day, 'yyyy-MM-dd')
          ) * 150; 
        const countHemodialise = countProducoesComNomes(
          format(day, 'yyyy-MM-dd'),
          ['HEMODIÁLISE']
        ) * 108; // Multiplica por 108 para HEMODIÁLISE
        const countHdfcMeio = countProducoesComNomes(
            format(day, 'yyyy-MM-dd'),
            ['HDC (0,5)']
          ) * 180;
          const countHdfcInteiro = countProducoesComNomes(
            format(day, 'yyyy-MM-dd'),
            ['HDC (1,0)']
          ) * 360;
        return countParecerVisita + countHemodialise + countCateter + countHdfcMeio + countHdfcInteiro;
      });
      setValores(calculatedValores);
      const total = calculatedValores.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      setTotalMensal(total);
  }, [selectedMonth]);


  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    const currentDate = new Date();
    const selectedYear = currentDate.getFullYear();
    const selectedDate = new Date(selectedYear, parseInt(event.target.value) - 1, 1);
    const daysArray = getDaysInMonth(selectedDate.getMonth() + 1, selectedYear);
    setDaysOfMonth(daysArray);
  };

  
  function countCondutasComNome(dataSelecionada, nomeConduta) {
    let count = 0;
  
    pacientes.forEach((paciente) => {
      paciente.producao.forEach((item) => {
        if (item.conduta.nome === nomeConduta && item.criada_em.startsWith(dataSelecionada)) {
          count++;
        }
      });
    });
  
    return count;
  }

  function countProducoesComNomes(dataSelecionada, nomesProducao) {
    let count = 0;
  
    pacientes.forEach((paciente) => {
      paciente.producao.forEach((item) => {
        if (nomesProducao.includes(item.producao.nome) && item.criada_em.startsWith(dataSelecionada)) {
          count++;
        }
      });
    });
    
    return count;
  }
  
  

  function countProducoesComCateter(dataSelecionada) {
    let count = 0;
  
    pacientes.forEach((paciente) => {
      paciente.producao.forEach((item) => {
        if (item.usou_cateter && item.criada_em.startsWith(dataSelecionada)) {
          count++;
        }
      });
    });
  
    return count;
  }

  // Use useEffect para carregar os dias do mês atual ao renderizar
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Mês atual
    const currentYear = currentDate.getFullYear();
    const daysArray = getDaysInMonth(currentMonth, currentYear);
    setDaysOfMonth(daysArray);
    setSelectedMonth(currentMonth.toString()); // Defina o mês selecionado como o mês atual
  }, []); // O segundo argumento vazio [] garante que isso seja executado apenas uma vez

  return (
    <div className="container mt-4">
      <h2>Producao do Mês: R$ {totalMensal}</h2>
      <div className="form-group col-4 col-md-3 mb-2">
        <label htmlFor="monthSelect">Selecione o Mês:</label>
        <select
          id="monthSelect"
          className="form-control"
          value={selectedMonth}
          onChange={handleMonthChange}
        >
          {/* Opções para os meses */}
          <option value="1">Janeiro</option>
          <option value="2">Fevereiro</option>
          <option value="3">Março</option>
          <option value="4">Abril</option>
          <option value="5">Maio</option>
          <option value="6">Junho</option>
          <option value="7">Julho</option>
          <option value="8">Agosto</option>
          <option value="9">Setembro</option>
          <option value="10">Outubro</option>
          <option value="11">Novembro</option>
          <option value="12">Dezembro</option>
          {/* Adicione outras opções para os meses aqui */}
        </select>
      </div>
      <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Dia</th>
            <th>PARECER/VISITA (SEM PROCEDIMENTO)</th>
            <th>HEMODIÁLISE</th>
            <th>HDFC</th>
            <th>CATETER</th>
            <th>VALOR</th>
          </tr>
        </thead>
        <tbody>
          {daysOfMonth.map((day, index) => (
            <tr key={index}>
              <td>{format(day, 'dd/MM/yyyy')}</td>
              <td> {countProducoesComNomes(format(day, 'yyyy-MM-dd'), ['PARECER', 'VISITA'])}</td>
              <td> {countProducoesComNomes(format(day, 'yyyy-MM-dd'), ['HEMODIÁLISE'])}</td>
              <td> {countProducoesComNomes(format(day, 'yyyy-MM-dd'), ['HDC (1,0)']) + countProducoesComNomes(format(day, 'yyyy-MM-dd'), ['HDC (0,5)'])*0.5}</td>
              <td> {countProducoesComCateter(format(day, 'yyyy-MM-dd'))}</td>
              <td> {valores[index]}</td>
            </tr>
            
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default Producao;
