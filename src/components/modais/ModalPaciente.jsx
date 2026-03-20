import { Button, Form, Modal } from 'react-bootstrap';

export const ModalPaciente = ({ showModal, handleCloseModal, handleSubmit, modoEdicao, pacienteAtual, hospitais, convenios }) => {
  const diagnosticoAtual = Array.isArray(pacienteAtual?.diagnostico)
    ? pacienteAtual.diagnostico.join(', ')
    : pacienteAtual?.diagnostico || '';

  return (
    <Modal show={showModal} onHide={handleCloseModal} size="lg" centered dialogClassName="app-modal">
      <Modal.Header closeButton>
        <Modal.Title>{modoEdicao ? 'Editar paciente' : 'Novo paciente'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="modal-body-scroll">
          <div className="form-grid">
            <Form.Group className="field field-span-2" controlId="formNome">
              <Form.Label>Nome completo</Form.Label>
              <Form.Control type="text" name="nome" defaultValue={modoEdicao ? pacienteAtual?.nome : ''} required />
            </Form.Group>

            <Form.Group className="field">
              <Form.Label>Setor</Form.Label>
              <Form.Control type="text" name="setor" defaultValue={modoEdicao ? pacienteAtual?.setor : ''} required />
            </Form.Group>

            <Form.Group className="field">
              <Form.Label>Idade</Form.Label>
              <Form.Control type="number" min="0" name="idade" defaultValue={modoEdicao ? pacienteAtual?.idade : ''} required />
            </Form.Group>

            <Form.Group className="field">
              <Form.Label>Registro</Form.Label>
              <Form.Control type="text" name="registro" defaultValue={modoEdicao ? pacienteAtual?.registro : ''} required />
            </Form.Group>

            <Form.Group className="field">
              <Form.Label>Convênio</Form.Label>
              <Form.Select name="convenio" defaultValue={modoEdicao ? pacienteAtual?.convenio : ''} required>
                <option value="">Selecione um convênio</option>
                {[...convenios].sort((a, b) => a.nome.localeCompare(b.nome)).map(convenio => (
                  <option key={convenio.id} value={convenio.nome}>
                    {convenio.nome}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="field field-span-2">
              <Form.Label>Hospital</Form.Label>
              <Form.Select name="hospital" defaultValue={modoEdicao ? pacienteAtual?.hospital : ''} required>
                <option value="">Selecione um hospital</option>
                {[...hospitais].sort((a, b) => a.nome.localeCompare(b.nome)).map(hospital => (
                  <option key={hospital.id} value={hospital.nome}>
                    {hospital.nome}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="field field-span-2">
              <Form.Label>Diagnóstico</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="diagnostico"
                defaultValue={diagnosticoAtual}
                placeholder="Ex.: HAS, DM, IRA"
                required
              />
            </Form.Group>

            <Form.Group className="field field-span-2">
              <Form.Check type="switch" label="Paciente recebeu alta" name="alta" defaultChecked={modoEdicao ? pacienteAtual?.alta : false} />
            </Form.Group>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            {modoEdicao ? 'Salvar alterações' : 'Cadastrar paciente'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
