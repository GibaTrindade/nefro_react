import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { collectionGroup, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

function getDaysInMonth(month, year) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    daysArray.push(new Date(year, month - 1, day));
  }

  return daysArray;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s*\+\s*/g, '+')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function countProducoesComNomes(registros, dataSelecionada, nomesProducao) {
  const nomesNormalizados = nomesProducao.map(nome => normalizeText(nome));

  return registros.filter(item => {
    const nomeProducao = normalizeText(item.producao?.nome);
    return nomesNormalizados.some(nome => nomeProducao === nome || nomeProducao.startsWith(`${nome}+`)) && item.criada_em?.startsWith(dataSelecionada);
  }).length;
}

function countProducoesComCateter(registros, dataSelecionada) {
  return registros.filter(item => item.usou_cateter && item.criada_em?.startsWith(dataSelecionada)).length;
}

function Producao() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [daysOfMonth, setDaysOfMonth] = useState([]);
  const [valores, setValores] = useState([]);
  const [totalMensal, setTotalMensal] = useState(0);
  const [producoesRegistros, setProducoesRegistros] = useState([]);
  const [dadosEmCache, setDadosEmCache] = useState(false);
  const [resumo, setResumo] = useState({
    parecerVisita: 0,
    hemodialise: 0,
    hdc: 0,
    cateter: 0,
    diasComMovimento: 0,
  });

  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    setSelectedMonth(currentMonth.toString());
  }, []);

  useEffect(() => {
    const producoesQuery = collectionGroup(db, 'producoes');

    return onSnapshot(producoesQuery, snapshot => {
      setProducoesRegistros(snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() })));
      setDadosEmCache(snapshot.metadata.fromCache);
    });
  }, []);

  useEffect(() => {
    if (!selectedMonth) {
      return;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const monthDays = getDaysInMonth(Number(selectedMonth), currentYear);
    const calculatedValores = monthDays.map(day => {
      const dataSelecionada = format(day, 'yyyy-MM-dd');
      const countParecerVisita = countProducoesComNomes(producoesRegistros, dataSelecionada, ['PARECER', 'VISITA', 'VISITA+CATETER']) * 70;
      const countCateter = countProducoesComCateter(producoesRegistros, dataSelecionada) * 150;
      const countHemodialise = countProducoesComNomes(producoesRegistros, dataSelecionada, ['HEMODIALISE']) * 108;
      const countHdcMeio = countProducoesComNomes(producoesRegistros, dataSelecionada, ['HDC (0,5)']) * 180;
      const countHdcInteiro = countProducoesComNomes(producoesRegistros, dataSelecionada, ['HDC (1,0)']) * 360;

      return countParecerVisita + countCateter + countHemodialise + countHdcMeio + countHdcInteiro;
    });

    setDaysOfMonth(monthDays);
    setValores(calculatedValores);
    setTotalMensal(calculatedValores.reduce((accumulator, currentValue) => accumulator + currentValue, 0));

    let totalParecerVisita = 0;
    let totalHemodialise = 0;
    let totalHdc = 0;
    let totalCateter = 0;

    monthDays.forEach(day => {
      const dataSelecionada = format(day, 'yyyy-MM-dd');
      totalParecerVisita += countProducoesComNomes(producoesRegistros, dataSelecionada, ['PARECER', 'VISITA', 'VISITA+CATETER']);
      totalHemodialise += countProducoesComNomes(producoesRegistros, dataSelecionada, ['HEMODIALISE']);
      totalHdc +=
        countProducoesComNomes(producoesRegistros, dataSelecionada, ['HDC (1,0)']) +
        countProducoesComNomes(producoesRegistros, dataSelecionada, ['HDC (0,5)']) * 0.5;
      totalCateter += countProducoesComCateter(producoesRegistros, dataSelecionada);
    });

    setResumo({
      parecerVisita: totalParecerVisita,
      hemodialise: totalHemodialise,
      hdc: totalHdc,
      cateter: totalCateter,
      diasComMovimento: calculatedValores.filter(valor => valor > 0).length,
    });
  }, [selectedMonth, producoesRegistros]);

  const topDias = daysOfMonth
    .map((day, index) => ({
      dia: format(day, 'dd/MM'),
      valor: valores[index] || 0,
    }))
    .filter(item => item.valor > 0)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  return (
    <div className="page-shell">
      <div className="container-app">
        <section className="hero-card hero-card--compact">
          <div className="hero-copy">
            <span className="eyebrow">Produção</span>
            <h1>Resumo mensal com leitura rápida.</h1>
            <p>Comece pelos indicadores principais e desça para o detalhe diário só quando precisar.</p>
            <p>{dadosEmCache ? 'Modo offline ativo. Os totais serão confirmados quando a rede voltar.' : 'Dados sincronizados com as subcoleções de produção.'}</p>
          </div>

          <label className="field month-filter">
            <span>Mês</span>
            <select id="monthSelect" value={selectedMonth} onChange={event => setSelectedMonth(event.target.value)}>
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
            </select>
          </label>
        </section>

        <section className="stats-grid">
          <article className="metric-card metric-card--highlight">
            <span>Total estimado</span>
            <strong>{currencyFormatter.format(totalMensal)}</strong>
            <small>Faturamento calculado para o mês selecionado</small>
          </article>
          <article className="metric-card">
            <span>Parecer / Visita</span>
            <strong>{resumo.parecerVisita}</strong>
            <small>Atendimentos sem procedimento</small>
          </article>
          <article className="metric-card">
            <span>Hemodiálise</span>
            <strong>{resumo.hemodialise}</strong>
            <small>Sessões registradas</small>
          </article>
          <article className="metric-card">
            <span>HDC + Cateter</span>
            <strong>{resumo.hdc + resumo.cateter}</strong>
            <small>{resumo.diasComMovimento} dias com movimento</small>
          </article>
        </section>

        <section className="panel-grid">
          <article className="panel-card">
            <div className="section-heading">
              <span className="eyebrow">Picos do mês</span>
              <h2>Dias com maior valor</h2>
            </div>

            {topDias.length ? (
              <div className="activity-list">
                {topDias.map(item => (
                  <div key={item.dia} className="activity-row">
                    <div>
                      <strong>{item.dia}</strong>
                      <span>{currencyFormatter.format(item.valor)}</span>
                    </div>
                    <div className="activity-bar">
                      <span style={{ width: `${Math.max((item.valor / topDias[0].valor) * 100, 12)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="state-card state-card--compact">
                <p>Não há produções registradas neste mês.</p>
              </div>
            )}
          </article>

          <article className="panel-card">
            <div className="section-heading">
              <span className="eyebrow">Indicadores</span>
              <h2>Leitura operacional</h2>
            </div>

            <div className="summary-list">
              <div>
                <strong>{resumo.hdc}</strong>
                <span>HDC</span>
              </div>
              <div>
                <strong>{resumo.cateter}</strong>
                <span>Cateter</span>
              </div>
              <div>
                <strong>{daysOfMonth.length}</strong>
                <span>Dias no mês</span>
              </div>
            </div>
          </article>
        </section>

        <section className="panel-card">
          <div className="section-heading">
            <span className="eyebrow">Detalhe diário</span>
            <h2>Tabela de produção</h2>
          </div>

          <div className="table-card">
            <div className="table-responsive">
              <table className="table table-modern">
                <thead>
                  <tr>
                    <th>Dia</th>
                    <th>Parecer / Visita</th>
                    <th>Hemodiálise</th>
                    <th>HDC</th>
                    <th>Cateter</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {daysOfMonth.map((day, index) => {
                    const dataSelecionada = format(day, 'yyyy-MM-dd');
                    const hdcTotal =
                      countProducoesComNomes(producoesRegistros, dataSelecionada, ['HDC (1,0)']) +
                      countProducoesComNomes(producoesRegistros, dataSelecionada, ['HDC (0,5)']) * 0.5;

                    return (
                      <tr key={dataSelecionada}>
                        <td>{format(day, 'dd/MM/yyyy')}</td>
                        <td>{countProducoesComNomes(producoesRegistros, dataSelecionada, ['PARECER', 'VISITA', 'VISITA+CATETER'])}</td>
                        <td>{countProducoesComNomes(producoesRegistros, dataSelecionada, ['HEMODIALISE'])}</td>
                        <td>{hdcTotal}</td>
                        <td>{countProducoesComCateter(producoesRegistros, dataSelecionada)}</td>
                        <td>{currencyFormatter.format(valores[index] || 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Producao;
