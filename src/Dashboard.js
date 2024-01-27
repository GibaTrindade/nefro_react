// No início do arquivo Dashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext'
import { collection, getDocs,
  addDoc, onSnapshot, 
  serverTimestamp, query, orderBy,
  updateDoc, doc, getDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Container, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaPlus } from 'react-icons/fa';
import { ModalPaciente } from './components/modais/ModalPaciente';
import { ModalEvolucao } from './components/modais/ModalEvolucao';
import { ModalProducao } from './components/modais/ModalProducao';
import { ListaPacientes } from './components/ListaPacientes';

const Dashboard = () => {
  const [pacientes, setPacientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEvolucaoModal, setShowEvolucaoModal] = useState(false);
  const [showProducaoModal, setShowProducaoModal] = useState(false);
  const [hospitais, setHospitais] = useState([]);
  const [acessos, setAcessos] = useState([]);
  const [condutas, setCondutas] = useState([]);
  const [producoes, setProducoes] = useState([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [pacienteAtual, setPacienteAtual] = useState(null);
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [textoEvolucao, setTextoEvolucao] = useState("");
  const [evolucoes, setEvolucoes] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const [producaoAtual, setProducaoAtual] = useState(null);
  const [indiceProducaoAtual, setIndiceProducaoAtual] = useState(null);
  const [modoEdicaoProducao, setModoEdicaoProducao] = useState(false);
  const [nomeAcessoSelecionado, setNomeAcessoSelecionado] = useState('');
  const [nomeCondutaSelecionada, setNomeCondutaSelecionada] = useState('');
  


  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "hospitais"));
      const hospitaisData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      
      const acessosSnap = await getDocs(collection(db, "acessos"));
      const condutasSnap = await getDocs(collection(db, "condutas"));
      const producoesSnap = await getDocs(collection(db, "producoes"));
      
      setHospitais(hospitaisData);
      setAcessos(acessosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCondutas(condutasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setProducoes(producoesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
  
    fetchData();
  }, []);

  

  useEffect(() => {
    const filtrarEAgruparPacientes = (pacientes, mostrarAlta) => {
      const pacientesFiltrados = pacientes.filter(p => p.alta === mostrarAlta);
      return agruparPorHospital(pacientesFiltrados);
    };
    let queryConstruida = collection(db, "pacientes");
    
    // if (mostrarAlta) {
    //   queryConstruida = query(queryConstruida, 
    //                             where("alta", "==", true), 
    //                             orderBy("hospital"), // Primeiro ordena por hospital
    //                             orderBy("nome")   );
    // } else {
      queryConstruida = query(queryConstruida, 
                              orderBy("hospital"), // Primeiro ordena por hospital
                              orderBy("nome")   );
   // }
  
    const unsubscribe = onSnapshot(queryConstruida, (snapshot) => {
      const pacientesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      const pacientesFiltradosEAgrupados = filtrarEAgruparPacientes(pacientesData, mostrarAlta);
      setPacientes(pacientesFiltradosEAgrupados);
    });
  
    return () => unsubscribe();
  }, [mostrarAlta]);
  
  const agruparPorHospital = (pacientes) => {
    return pacientes.reduce((acc, paciente) => {
      acc[paciente.hospital] = acc[paciente.hospital] || [];
      acc[paciente.hospital].push(paciente);
      return acc;
    }, {});
  };
  

  useEffect(() => {
    if (modoEdicaoProducao && producaoAtual) {
      setNomeAcessoSelecionado(producaoAtual.acesso.nome);
      setNomeCondutaSelecionada(producaoAtual.conduta.nome);
      // Repita para outros campos
    }
  }, [modoEdicaoProducao, producaoAtual]);

  //const pacientesPorHospital = agruparPorHospital(pacientes);  

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { nome, setor, idade, registro, diagnostico, alta, convenio, hospital } = event.target.elements;
    if (modoEdicao) {
      const pacienteRef = doc(db, "pacientes", pacienteAtual.id);
        await updateDoc(pacienteRef, {
          nome: nome.value,
          setor: setor.value,
          idade: parseInt(idade.value, 10),
          registro: registro.value,
          diagnostico: diagnostico.value.split(",").map(d => d.trim()), // Assumindo que os diagnósticos são separados por vírgulas
          alta: alta.checked,
          convenio: convenio.value,
          hospital: hospital.value
      });
    } else {
    try {
      await addDoc(collection(db, "pacientes"), {
        nome: nome.value,
        setor: setor.value,
        idade: parseInt(idade.value, 10),
        registro: registro.value,
        diagnostico: diagnostico.value.split(",").map(d => d.trim()), // Assumindo que os diagnósticos são separados por vírgulas
        alta: alta.checked,
        convenio: convenio.value,
        hospital: hospital.value,
        criadoEm: serverTimestamp()
      });
      handleCloseModal();
      // Atualizar a lista de pacientes
    } catch (error) {
      console.error("Erro ao adicionar paciente:", error);
    }
    }
    setShowModal(false);
    setModoEdicao(false);
    setPacienteAtual(null);
  };



// Função para adicionar uma nova evolução
const adicionarEvolucao = async () => {
  const pacienteRef = doc(db, "pacientes", pacienteAtual.id);
  const newEvolucao = {
    texto: textoEvolucao,
    user_id: currentUser.uid
  };
  await updateDoc(pacienteRef, {
    evolucao: arrayUnion(newEvolucao)
  });
  handleCloseEvolucaoModal()
};

const handleSubmitProducao = async (event) => {
  event.preventDefault();
  const { nomeAcesso, dataAcesso, nomeConduta, nomeProducao, usouCateter } = event.target.elements;
  const dataAcessoTimestamp = dataAcesso.value ? Timestamp.fromDate(new Date(dataAcesso.value)) : null;

  const pacienteRef = doc(db, "pacientes", pacienteAtual.id);

  if (modoEdicaoProducao && indiceProducaoAtual != null) {
    // Atualizar uma produção existente
    const producaoAtualizada = {
      acesso: { nome: nomeAcesso.value, data: dataAcessoTimestamp },
      conduta: { nome: nomeConduta.value },
      producao: { nome: nomeProducao.value },
      usou_cateter: usouCateter.checked,
      user: currentUser.email // Pode manter o usuário original ou atualizar
    };

    const pacienteDoc = await getDoc(pacienteRef);
    const producoes = pacienteDoc.data().producao;

    producoes[indiceProducaoAtual] = producaoAtualizada;

    await updateDoc(pacienteRef, { producao: producoes });
  } else {
  const novaProducao = {
    acesso: { nome: nomeAcesso.value, data: dataAcessoTimestamp },
    conduta: { nome: nomeConduta.value },
    producao: { nome: nomeProducao.value },
    usou_cateter: usouCateter.checked,
    user: currentUser.email, // Usando o e-mail do usuário logado
    criadaEm: Timestamp.now() // Timestamp do momento da criação
  };

  // Adicionar novaProducao ao paciente no Firebase
  const pacienteRef = doc(db, "pacientes", pacienteAtual.id);
  await updateDoc(pacienteRef, {
    producao: arrayUnion(novaProducao)
  });
}

  handleCloseProducaoModal();
};

const editarProducao = (producao, index) => {
  // Define a produção atual para edição
  setProducaoAtual(producao);
  setModoEdicaoProducao(true);
  setIndiceProducaoAtual(index);
  setNomeCondutaSelecionada(producao.conduta.nome);
  // Abre um formulário de edição ou modifica o estado para mostrar o formulário de edição
  // ...
};

// ABRIR E FECHAR MODAL
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setModoEdicao(false);
  }

  const abrirModalEdicao = (paciente) => {
    setPacienteAtual(paciente);
    setModoEdicao(true);
    setShowModal(true);
  };

  const handleCloseEvolucaoModal = () => {
    
    setShowEvolucaoModal(false);
    //setPacienteAtual(null)
  };

  const abrirModalEvolucao = (paciente) => {
    setPacienteAtual(paciente);
    setShowEvolucaoModal(true);
  
    // Assumindo que 'paciente' já inclui as evoluções
    // Não é necessário buscar as evoluções separadamente
    setEvolucoes(paciente.evolucao || []);
    //setPacienteAtual(paciente)
  };

  const abrirModalProducao = (paciente) => {
    setPacienteAtual(paciente);
    setShowProducaoModal(true);
  };
  
  const handleCloseProducaoModal = () => {
    setShowProducaoModal(false);
    setModoEdicaoProducao(false);
  };
  

  return (
    <Container>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'start', marginBottom: '1em' }}>
        <h1 style={{ marginRight: '1em' }}>Pacientes</h1>
        <Button 
            variant="success" 
            style={{ 
              borderRadius: '50%', 
              width: '2.5em',   // Largura do botão
              height: '2.5em',  // Altura do botão
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center'
            }} 
            onClick={handleShowModal}>
          <FaPlus size="1.5em" />
        </Button>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Form.Check 
          type="checkbox" 
          label="Pacientes com alta" 
          checked={mostrarAlta}
          onChange={(e) => {
            setMostrarAlta(e.target.checked);
          }}
        />
      </div>
      <ModalPaciente 
          showModal={showModal} 
          handleCloseModal={handleCloseModal} 
          handleSubmit={handleSubmit} 
          modoEdicao={modoEdicao} 
          pacienteAtual={pacienteAtual} 
          hospitais={hospitais}/>
      <ModalEvolucao 
          showEvolucaoModal={showEvolucaoModal}
          handleCloseEvolucaoModal={handleCloseEvolucaoModal}
          evolucoes={evolucoes}
          adicionarEvolucao={adicionarEvolucao}
          setTextoEvolucao={setTextoEvolucao}/>
      <ModalProducao 
          showProducaoModal={showProducaoModal} 
          handleCloseProducaoModal={handleCloseProducaoModal} 
          handleSubmitProducao={handleSubmitProducao}
          editarProducao={editarProducao}
          pacienteAtual={pacienteAtual}
          acessos={acessos} 
          condutas={condutas} 
          producoes={producoes}
          currentUser={currentUser}
          modoEdicaoProducao={modoEdicaoProducao}
          producaoAtual={producaoAtual}
          setNomeCondutaSelecionada={setNomeCondutaSelecionada}
          nomeCondutaSelecionada={nomeCondutaSelecionada}/>
      <ListaPacientes 
          pacientes={pacientes} 
          abrirModalEdicao={abrirModalEdicao} 
          abrirModalProducao={abrirModalProducao}
          abrirModalEvolucao={abrirModalEvolucao}/>
    {/*
      <Row xs={1} md={3} className="g-4">
        {pacientes.map(paciente => (
          <Col key={paciente.id}>
            <Card>
              <Card.Body>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Card.Title>{paciente.nome}</Card.Title>
                <Button variant="outline-warning" 
                size="sm"
                onClick={() => abrirModalEdicao(paciente)}>
                  <FaPencilAlt /> Editar
                  </Button>
              </div>
                <Card.Text>
                  <strong>Setor:</strong> {paciente.setor}<br />
                  <strong>Idade:</strong> {paciente.idade}<br />
                  <strong>Registro:</strong> {paciente.registro}<br />
                  <strong>Diagnóstico:</strong> {paciente.diagnostico?.join(", ")}<br />
                  <strong>Evolução:</strong> {paciente.evolucao && paciente.evolucao.length > 0
                            ? paciente.evolucao[paciente.evolucao.length - 1].texto.substring(0, 15) + '...'
                            : 'Sem evoluções'}<br />
                  <strong>Alta:</strong> {paciente.alta ? "Sim" : "Não"}<br />
                  <strong>Convênio:</strong> {paciente.convenio}<br />
                  <strong>Hospital:</strong> {paciente.hospital}
                  
              </Card.Text>
              <div style={{ textAlign: 'right' }}>
              <Button variant="primary" size="sm" onClick={() => abrirModalEvolucao(paciente)}>Evoluções</Button>
            </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      */}
    </Container>
  );
};

export default Dashboard;
