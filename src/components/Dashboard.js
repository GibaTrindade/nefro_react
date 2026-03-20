import React, { useContext, useEffect, useState } from 'react';
import { Container, Form } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { AuthContext } from '../AuthContext';
import { db } from '../firebase';
import { ListaPacientes } from './ListaPacientes';
import { ModalEvolucao } from './modais/ModalEvolucao';
import { ModalPaciente } from './modais/ModalPaciente';
import { ModalProducao } from './modais/ModalProducao';

const Dashboard = ({ pacientes, mostrarAlta, setMostrarAlta }) => {
  const [showModal, setShowModal] = useState(false);
  const [showEvolucaoModal, setShowEvolucaoModal] = useState(false);
  const [showProducaoModal, setShowProducaoModal] = useState(false);
  const [hospitais, setHospitais] = useState([]);
  const [convenios, setConvenios] = useState([]);
  const [acessos, setAcessos] = useState([]);
  const [condutas, setCondutas] = useState([]);
  const [producoesCatalogo, setProducoesCatalogo] = useState([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [pacienteAtual, setPacienteAtual] = useState(null);
  const [textoEvolucao, setTextoEvolucao] = useState('');
  const [evolucoes, setEvolucoes] = useState([]);
  const [producaoAtual, setProducaoAtual] = useState(null);
  const [historicoProducoes, setHistoricoProducoes] = useState([]);
  const [modoEdicaoProducao, setModoEdicaoProducao] = useState(false);
  const [nomeCondutaSelecionada, setNomeCondutaSelecionada] = useState('');
  const [busca, setBusca] = useState('');
  const [dadosAuxiliaresEmCache, setDadosAuxiliaresEmCache] = useState(false);
  const [mensagemSync, setMensagemSync] = useState('');
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const unsubscribeHospitais = onSnapshot(collection(db, 'hospitais'), snapshot => {
      setHospitais(snapshot.docs.map(docSnapshot => ({ ...docSnapshot.data(), id: docSnapshot.id })));
      setDadosAuxiliaresEmCache(snapshot.metadata.fromCache);
    });

    const unsubscribeAcessos = onSnapshot(collection(db, 'acessos'), snapshot => {
      setAcessos(snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() })));
    });

    const unsubscribeCondutas = onSnapshot(collection(db, 'condutas'), snapshot => {
      setCondutas(snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() })));
    });

    const unsubscribeProducoes = onSnapshot(collection(db, 'producoes'), snapshot => {
      setProducoesCatalogo(snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() })));
    });

    const unsubscribeConvenios = onSnapshot(collection(db, 'convenios'), snapshot => {
      setConvenios(snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() })));
    });

    return () => {
      unsubscribeHospitais();
      unsubscribeAcessos();
      unsubscribeCondutas();
      unsubscribeProducoes();
      unsubscribeConvenios();
    };
  }, []);

  useEffect(() => {
    if (!showEvolucaoModal || !pacienteAtual?.id) {
      return undefined;
    }

    const evolucoesQuery = query(collection(db, 'pacientes', pacienteAtual.id, 'evolucoes'), orderBy('criada_em', 'desc'));

    return onSnapshot(evolucoesQuery, snapshot => {
      setEvolucoes(snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() })));
    });
  }, [showEvolucaoModal, pacienteAtual?.id]);

  useEffect(() => {
    if (!showProducaoModal || !pacienteAtual?.id) {
      return undefined;
    }

    const producoesQuery = query(collection(db, 'pacientes', pacienteAtual.id, 'producoes'), orderBy('criada_em', 'desc'));

    return onSnapshot(producoesQuery, snapshot => {
      setHistoricoProducoes(snapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() })));
    });
  }, [showProducaoModal, pacienteAtual?.id]);

  const pacientesAgrupados = Object.entries(pacientes || {});
  const todosPacientes = pacientesAgrupados.flatMap(([, pacientesDoHospital]) => pacientesDoHospital);
  const termoBusca = busca.trim().toLowerCase();
  const pacientesFiltrados = pacientesAgrupados.reduce((acc, [hospitalNome, pacientesDoHospital]) => {
    const filtrados = pacientesDoHospital.filter(paciente => {
      const campos = [
        paciente.nome,
        paciente.setor,
        paciente.registro,
        paciente.hospital,
        paciente.convenio,
        paciente.ultima_evolucao_texto,
        ...(paciente.diagnostico || []),
      ];

      return campos.some(campo => String(campo || '').toLowerCase().includes(termoBusca));
    });

    if (filtrados.length > 0) {
      acc[hospitalNome] = filtrados;
    }

    return acc;
  }, {});

  const pacientesVisiveis = Object.values(pacientesFiltrados).flat();
  const totalEvolucoes = pacientesVisiveis.filter(paciente => (paciente.evolucao_count || 0) > 0).length;
  const totalProducoes = pacientesVisiveis.filter(paciente => (paciente.producao_count || 0) > 0).length;

  const handleSubmit = event => {
    event.preventDefault();
    const { nome, setor, idade, registro, diagnostico, alta, convenio, hospital } = event.target.elements;
    const payload = {
      nome: nome.value.trim(),
      setor: setor.value.trim(),
      idade: parseInt(idade.value, 10),
      registro: registro.value.trim(),
      diagnostico: diagnostico.value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean),
      alta: alta.checked,
      convenio: convenio.value,
      hospital: hospital.value,
    };

    handleCloseModal();
    setMensagemSync('Alteração salva localmente. O app sincroniza assim que a rede voltar.');

    if (modoEdicao && pacienteAtual) {
      updateDoc(doc(db, 'pacientes', pacienteAtual.id), payload).catch(error => {
        console.error('Erro ao atualizar paciente:', error);
        setMensagemSync('Não foi possível sincronizar a alteração do paciente.');
      });
    } else {
      addDoc(collection(db, 'pacientes'), {
        ...payload,
        criadoEm: serverTimestamp(),
        evolucao_count: 0,
        producao_count: 0,
      }).catch(error => {
        console.error('Erro ao adicionar paciente:', error);
        setMensagemSync('Não foi possível sincronizar o cadastro do paciente.');
      });
    }
  };

  const adicionarEvolucao = event => {
    event.preventDefault();

    if (!pacienteAtual || !textoEvolucao.trim()) {
      return;
    }

    const textoAtual = textoEvolucao.trim();
    const criadaEm = new Date().toISOString();
    const pacienteRef = doc(db, 'pacientes', pacienteAtual.id);

    setTextoEvolucao('');
    handleCloseEvolucaoModal();
    setMensagemSync('Evolução salva localmente. A sincronização será retomada quando houver rede.');

    addDoc(collection(db, 'pacientes', pacienteAtual.id, 'evolucoes'), {
      texto: textoAtual,
      user_id: currentUser.uid,
      user_email: currentUser.email,
      criada_em: criadaEm,
    })
      .then(() =>
        updateDoc(pacienteRef, {
          evolucao_count: increment(1),
          ultima_evolucao_texto: textoAtual,
          ultima_evolucao_em: criadaEm,
        }),
      )
      .catch(error => {
        console.error('Erro ao salvar evolução:', error);
        setMensagemSync('Não foi possível sincronizar a evolução.');
      });
  };

  const handleSubmitProducao = event => {
    event.preventDefault();
    const { nomeAcesso, dataAcesso, nomeConduta, nomeProducao, usouCateter, dataProducao } = event.target.elements;

    if (!pacienteAtual) {
      return;
    }

    const pacienteRef = doc(db, 'pacientes', pacienteAtual.id);
    const novaProducao = {
      acesso: { nome: nomeAcesso.value, data: dataAcesso.value },
      conduta: { nome: nomeConduta.value },
      producao: { nome: nomeProducao.value },
      usou_cateter: usouCateter.checked,
      user: currentUser.email,
      criada_em: dataProducao.value,
    };

    handleCloseProducaoModal();
    setMensagemSync('Produção salva localmente. O app envia a sincronização quando a conexão voltar.');

    if (modoEdicaoProducao && producaoAtual?.id) {
      updateDoc(doc(db, 'pacientes', pacienteAtual.id, 'producoes', producaoAtual.id), novaProducao).catch(error => {
        console.error('Erro ao editar produção:', error);
        setMensagemSync('Não foi possível sincronizar a edição da produção.');
      });
      return;
    }

    addDoc(collection(db, 'pacientes', pacienteAtual.id, 'producoes'), novaProducao)
      .then(() =>
        updateDoc(pacienteRef, {
          producao_count: increment(1),
          ultima_producao_em: novaProducao.criada_em,
        }),
      )
      .catch(error => {
        console.error('Erro ao adicionar produção:', error);
        setMensagemSync('Não foi possível sincronizar a produção.');
      });
  };

  const editarProducao = producao => {
    setProducaoAtual(producao);
    setModoEdicaoProducao(true);
    setNomeCondutaSelecionada(producao.conduta?.nome || '');
  };

  const handleShowModal = () => {
    setPacienteAtual(null);
    setModoEdicao(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModoEdicao(false);
    setPacienteAtual(null);
  };

  const abrirModalEdicao = paciente => {
    setPacienteAtual(paciente);
    setModoEdicao(true);
    setShowModal(true);
  };

  const handleCloseEvolucaoModal = () => {
    setShowEvolucaoModal(false);
    setTextoEvolucao('');
  };

  const abrirModalEvolucao = paciente => {
    setPacienteAtual(paciente);
    setShowEvolucaoModal(true);
  };

  const abrirModalProducao = paciente => {
    setPacienteAtual(paciente);
    setShowProducaoModal(true);
    setModoEdicaoProducao(false);
    setProducaoAtual(null);
    setNomeCondutaSelecionada('');
  };

  const handleCloseProducaoModal = () => {
    setShowProducaoModal(false);
    setModoEdicaoProducao(false);
    setProducaoAtual(null);
    setNomeCondutaSelecionada('');
  };

  return (
    <div className="page-shell">
      <Container className="container-app">
        <section className="hero-card">
          <div className="hero-copy">
            <span className="eyebrow">Central de pacientes</span>
            <h1>Passagem de plantão - Nefrologia</h1>
            <p>
              Consulte pacientes, atualize evoluções e lance produção em uma interface enxuta, legível e pensada
              primeiro para o celular.
            </p>
          </div>
          <button type="button" className="button button-primary hero-action" onClick={handleShowModal}>
            <FaPlus />
            <span>Novo paciente</span>
          </button>
        </section>

        <section className="stats-grid">
          <article className="metric-card">
            <span>Pacientes visíveis</span>
            <strong>{pacientesVisiveis.length}</strong>
            <small>{mostrarAlta ? 'Filtro de alta ativo' : 'Pacientes em acompanhamento'}</small>
          </article>
          <article className="metric-card">
            <span>Hospitais</span>
            <strong>{Object.keys(pacientesFiltrados).length}</strong>
            <small>{todosPacientes.length} registros na base atual</small>
          </article>
          <article className="metric-card">
            <span>Com evolução</span>
            <strong>{totalEvolucoes}</strong>
            <small>Prontuários com anotações clínicas</small>
          </article>
          <article className="metric-card">
            <span>Com produção</span>
            <strong>{totalProducoes}</strong>
            <small>Pacientes com histórico de procedimentos</small>
          </article>
        </section>

        <section className="panel-card">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Filtros</span>
              <h2>Encontre o paciente certo mais rápido</h2>
              <p>{dadosAuxiliaresEmCache ? 'Modo offline ativo. Os dados serão sincronizados quando a rede voltar.' : 'Dados sincronizados com o Firebase.'}</p>
            </div>
          </div>

          {mensagemSync && <div className="form-alert">{mensagemSync}</div>}

          <div className="toolbar-grid">
            <label className="field">
              <span>Buscar paciente</span>
              <input
                type="search"
                placeholder="Nome, registro, setor, convênio ou hospital"
                value={busca}
                onChange={event => setBusca(event.target.value)}
              />
            </label>

            <div className="toggle-card">
              <div>
                <strong>Mostrar pacientes com alta</strong>
                <small>Alterne entre pacientes ativos e altas registradas.</small>
              </div>
              <Form.Check
                type="switch"
                id="mostrar-alta"
                checked={mostrarAlta}
                onChange={event => setMostrarAlta(event.target.checked)}
              />
            </div>
          </div>
        </section>

        <ModalPaciente
          showModal={showModal}
          handleCloseModal={handleCloseModal}
          handleSubmit={handleSubmit}
          modoEdicao={modoEdicao}
          pacienteAtual={pacienteAtual}
          hospitais={hospitais}
          convenios={convenios}
        />
        <ModalEvolucao
          showEvolucaoModal={showEvolucaoModal}
          handleCloseEvolucaoModal={handleCloseEvolucaoModal}
          evolucoes={evolucoes}
          adicionarEvolucao={adicionarEvolucao}
          setTextoEvolucao={setTextoEvolucao}
          textoEvolucao={textoEvolucao}
          pacienteAtual={pacienteAtual}
        />
        <ModalProducao
          showProducaoModal={showProducaoModal}
          handleCloseProducaoModal={handleCloseProducaoModal}
          handleSubmitProducao={handleSubmitProducao}
          editarProducao={editarProducao}
          pacienteAtual={pacienteAtual}
          acessos={acessos}
          condutas={condutas}
          producoes={producoesCatalogo}
          historicoProducoes={historicoProducoes}
          currentUser={currentUser}
          modoEdicaoProducao={modoEdicaoProducao}
          producaoAtual={producaoAtual}
          setNomeCondutaSelecionada={setNomeCondutaSelecionada}
          nomeCondutaSelecionada={nomeCondutaSelecionada}
        />

        <ListaPacientes
          pacientes={pacientesFiltrados}
          abrirModalEdicao={abrirModalEdicao}
          abrirModalProducao={abrirModalProducao}
          abrirModalEvolucao={abrirModalEvolucao}
          busca={busca}
        />
      </Container>
    </div>
  );
};

export default Dashboard;
