// No início do arquivo Dashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext'
import { collection, getDocs,
  addDoc, 
  serverTimestamp,
  updateDoc, doc, getDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { Container, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaPlus } from 'react-icons/fa';
import { ModalPaciente } from './modais/ModalPaciente';
import { ModalEvolucao } from './modais/ModalEvolucao';
import { ModalProducao } from './modais/ModalProducao';
import { ListaPacientes } from './ListaPacientes';

const Dashboard = ({pacientes, setPacientes, mostrarAlta, setMostrarAlta}) => {
  //const [pacientes, setPacientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEvolucaoModal, setShowEvolucaoModal] = useState(false);
  const [showProducaoModal, setShowProducaoModal] = useState(false);
  const [hospitais, setHospitais] = useState([]);
  const [convenios, setConvenios] = useState([]);
  const [acessos, setAcessos] = useState([]);
  const [condutas, setCondutas] = useState([]);
  const [producoes, setProducoes] = useState([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [pacienteAtual, setPacienteAtual] = useState(null);
  //const [mostrarAlta, setMostrarAlta] = useState(false);
  const [textoEvolucao, setTextoEvolucao] = useState("");
  const [evolucoes, setEvolucoes] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const [producaoAtual, setProducaoAtual] = useState(null);
  const [indiceProducaoAtual, setIndiceProducaoAtual] = useState(null);
  const [modoEdicaoProducao, setModoEdicaoProducao] = useState(false);
  //const [nomeAcessoSelecionado, setNomeAcessoSelecionado] = useState('');
  const [nomeCondutaSelecionada, setNomeCondutaSelecionada] = useState('');
  


  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "hospitais"));
      const hospitaisData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      
      const acessosSnap = await getDocs(collection(db, "acessos"));
      const condutasSnap = await getDocs(collection(db, "condutas"));
      const producoesSnap = await getDocs(collection(db, "producoes"));
      const conveniosSnap = await getDocs(collection(db, "convenios"));
      
      setHospitais(hospitaisData);
      setAcessos(acessosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCondutas(condutasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setProducoes(producoesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setConvenios(conveniosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
  
    fetchData();
  }, []);

  

  
  
  
  

  // useEffect(() => {
  //   if (modoEdicaoProducao && producaoAtual) {
  //     setNomeAcessoSelecionado(producaoAtual.acesso.nome);
  //     setNomeCondutaSelecionada(producaoAtual.conduta.nome);
  //     // Repita para outros campos
  //   }
  // }, [modoEdicaoProducao, producaoAtual]);

  //const pacientesPorHospital = agruparPorHospital(pacientes);  

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { nome, setor, idade, registro, diagnostico, alta, convenio, hospital } = event.target.elements;
    if (modoEdicao) {
      handleCloseModal();
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
      handleCloseModal();
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
const adicionarEvolucao = async (event) => {
  event.preventDefault();
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
  const { nomeAcesso, dataAcesso, nomeConduta, nomeProducao, usouCateter, dataProducao } = event.target.elements;
  console.log(dataAcesso.value)
  //const dataAcessoTimestamp = dataAcesso.value ? Timestamp.fromDate(new Date(dataAcesso.value)) : null;
  //console.log(dataAcessoTimestamp)
  const pacienteRef = doc(db, "pacientes", pacienteAtual.id);

  if (modoEdicaoProducao && indiceProducaoAtual != null) {
    // Atualizar uma produção existente
    const producaoAtualizada = {
      acesso: { nome: nomeAcesso.value, data: dataAcesso.value },
      conduta: { nome: nomeConduta.value },
      producao: { nome: nomeProducao.value },
      usou_cateter: usouCateter.checked,
      user: currentUser.email,
      criada_em: dataProducao.value // Pode manter o usuário original ou atualizar
    };

    const pacienteDoc = await getDoc(pacienteRef);
    const producoes = pacienteDoc.data().producao;

    producoes[indiceProducaoAtual] = producaoAtualizada;

    await updateDoc(pacienteRef, { producao: producoes });
  } else {
  const novaProducao = {
    acesso: { nome: nomeAcesso.value, data: dataAcesso.value },
    conduta: { nome: nomeConduta.value },
    producao: { nome: nomeProducao.value },
    usou_cateter: usouCateter.checked,
    user: currentUser.email, // Usando o e-mail do usuário logado
    criada_em: dataProducao.value // Timestamp do momento da criação
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
          hospitais={hospitais}
          convenios={convenios}/>
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
