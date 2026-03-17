import { Button, Form, Modal } from 'react-bootstrap';

const formatarData = data => {
  if (!data) {
    return 'Agora';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(data));
};

export const ModalEvolucao = ({
  showEvolucaoModal,
  handleCloseEvolucaoModal,
  evolucoes,
  adicionarEvolucao,
  setTextoEvolucao,
  textoEvolucao,
  pacienteAtual,
}) => {
  return (
    <Modal show={showEvolucaoModal} onHide={handleCloseEvolucaoModal} size="lg" centered dialogClassName="app-modal">
      <Modal.Header closeButton>
        <Modal.Title>Evolucoes de {pacienteAtual?.nome || 'paciente'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body-scroll">
        <div className="timeline-list">
          {evolucoes.length ? (
            evolucoes.map((evolucao, index) => (
              <article key={`${evolucao.criada_em || 'item'}-${index}`} className="timeline-item">
                <div className="timeline-item__meta">
                  <strong>{evolucao.user_email || 'Equipe assistencial'}</strong>
                  <span>{formatarData(evolucao.criada_em)}</span>
                </div>
                <p>{evolucao.texto}</p>
              </article>
            ))
          ) : (
            <div className="state-card state-card--compact">
              <p>Nenhuma evolucao registrada ate o momento.</p>
            </div>
          )}
        </div>

        <Form onSubmit={adicionarEvolucao}>
          <Form.Group className="field">
            <Form.Label>Nova evolucao</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Descreva a evolucao clinica de forma objetiva"
              value={textoEvolucao}
              onChange={event => setTextoEvolucao(event.target.value)}
              required
            />
          </Form.Group>
          <div className="modal-actions">
            <Button variant="light" onClick={handleCloseEvolucaoModal}>
              Fechar
            </Button>
            <Button variant="success" type="submit">
              Salvar evolucao
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
