import {Button, Modal, Form } from 'react-bootstrap';

export const ModalPaciente = ({showModal, handleCloseModal, handleSubmit, modoEdicao, pacienteAtual, hospitais}) => {


    return (
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
            <Form.Control type="text" name="diagnostico" defaultValue={modoEdicao ? pacienteAtual.diagnostico : ''} 
                          placeholder='HAS, DM, IRA' required />
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
    )



}