import { Card, Row, Col, Button, Accordion } from 'react-bootstrap';
import { FaPencilAlt } from 'react-icons/fa';


export const ListaPacientes = ({
    pacientes, 
    abrirModalEdicao, 
    abrirModalProducao,
    abrirModalEvolucao,
}) => {


    return (

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
                              <Card.Title>{paciente.nome.length > 20 ? paciente.nome.slice(0, 20) + '...' : paciente.nome}</Card.Title>
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
                            <div className="d-flex justify-content-between" >
                            <Button variant="outline-primary" size="sm" onClick={() => abrirModalProducao(paciente)}>Ver Produções</Button>
                            <Button variant="outline-primary" size="sm" onClick={() => abrirModalEvolucao(paciente)}>Evoluções</Button>
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
    )
}