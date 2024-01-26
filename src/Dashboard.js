// No início do arquivo Dashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext'
import { collection, getDocs, 
  addDoc, onSnapshot, 
  serverTimestamp, query, orderBy,
  updateDoc, doc, arrayUnion   } from 'firebase/firestore';
import { db } from './firebase';
import { Card, Row, Col, Container, Button, Modal, Form, Accordion } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaPencilAlt, FaPlus } from 'react-icons/fa';

const Dashboard = () => {
  const [pacientes, setPacientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEvolucaoModal, setShowEvolucaoModal] = useState(false);
  const [hospitais, setHospitais] = useState([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [pacienteAtual, setPacienteAtual] = useState(null);
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [textoEvolucao, setTextoEvolucao] = useState("");
  const [evolucoes, setEvolucoes] = useState([]);
  const { currentUser } = useContext(AuthContext);


  useEffect(() => {
    const fetchHospitais = async () => {
      const querySnapshot = await getDocs(collection(db, "hospitais"));
      const hospitaisData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setHospitais(hospitaisData);
    };
  
    fetchHospitais();
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
      <Modal show={showModal} onHide={handleCloseModal} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header closeButton>
          <Modal.Title>Novo Paciente</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: 'calc(100vh - 210px)', overflowY: 'auto' }}>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formNome">
              <Form.Label>Nome</Form.Label>
              <Form.Control type="text" name="nome" defaultValue={modoEdicao ? pacienteAtual.nome : ''} required />
            </Form.Group>
            <Form.Group className="mb-3">
            <Form.Label>Setor</Form.Label>
            <Form.Control type="text" name="setor" defaultValue={modoEdicao ? pacienteAtual.setor : ''} required />
            </Form.Group>
            <Form.Group className="mb-3">
            <Form.Label>Idade</Form.Label>
            <Form.Control type="number" name="idade" defaultValue={modoEdicao ? pacienteAtual.idade : ''} required />
            </Form.Group>
            <Form.Group className="mb-3">
            <Form.Label>Registro</Form.Label>
            <Form.Control type="text" name="registro" defaultValue={modoEdicao ? pacienteAtual.registro : ''} required />
            </Form.Group>
            <Form.Group className="mb-3">
            <Form.Label>Diagnóstico</Form.Label>
            <Form.Control type="text" name="diagnostico" defaultValue={modoEdicao ? pacienteAtual.diagnostico : ''} required />
            </Form.Group>
            <Form.Group className="mb-3">
            <Form.Check type="checkbox" label="Alta" name="alta" defaultChecked={modoEdicao ? pacienteAtual.alta : ''} />
            </Form.Group>
            <Form.Group className="mb-3">
            <Form.Label>Convênio</Form.Label>
            <Form.Control type="text" name="convenio" defaultValue={modoEdicao ? pacienteAtual.convenio : ''} required />
            </Form.Group>
            <Form.Group className="mb-3">
            <Form.Label>Hospital</Form.Label>
            <Form.Select name="hospital" defaultValue={modoEdicao ? pacienteAtual.hospital : ''} required>
              <option value="">Selecione um Hospital</option>
              {hospitais.map(hospital => (
                <option key={hospital.id} value={hospital.nome}>{hospital.nome}</option>
              ))}
            </Form.Select>
            </Form.Group>
            {/* Outros campos do formulário */}
            <Button variant="primary" type="submit">Salvar</Button>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal show={showEvolucaoModal} onHide={handleCloseEvolucaoModal}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Evolução</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div>
          <h5>Evoluções:</h5>
          <div className="border p-3 rounded mt-2 mb-4 overflow-auto" style={{ maxHeight: '200px' }}>
            {evolucoes.length > 1 ? evolucoes.slice(0, -1).map(e => e.texto).join('. ') + '. ' : ''}
            <span className={evolucoes.length > 0 ? "text-danger" : ""}>
              {evolucoes.length > 0 ? evolucoes[evolucoes.length - 1].texto : ''}
            </span>
          </div>
        </div>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Evolução</Form.Label>
              <div style={{ display: 'flex' }}>
                <Form.Control type="text" placeholder="Digite a evolução" onChange={(e) => setTextoEvolucao(e.target.value)} />
                <Button variant="success" style={{ marginLeft: '10px' }} onClick={adicionarEvolucao}>
                  + Evolução
                </Button>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
      </Modal>
      <Accordion>
      {Object.entries(pacientes).map(([hospitalNome, pacientesDoHospital], index) => (
        <Accordion.Item eventKey={hospitalNome} key={hospitalNome}>
          <Accordion.Header>{hospitalNome}</Accordion.Header>
          <Accordion.Body>        
            
                  <Row xs={1} md={3} className="g-4">
                    {pacientesDoHospital.map(paciente => (
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
                
          </Accordion.Body>
      </Accordion.Item>
      ))}
      
    </Accordion>
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
