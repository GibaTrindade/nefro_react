import { Button, Form, Modal } from 'react-bootstrap';

const parseDateSafely = data => {
  if (!data) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    const [year, month, day] = data.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(data);
};

const formatarData = data => {
  if (!data) {
    return 'Data nao informada';
  }

  const parsedDate = parseDateSafely(data);

  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return 'Data invalida';
  }

  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(parsedDate);
};

export const ModalProducao = ({
  showProducaoModal,
  handleCloseProducaoModal,
  handleSubmitProducao,
  editarProducao,
  pacienteAtual,
  acessos,
  condutas,
  producoes,
  historicoProducoes,
  currentUser,
  modoEdicaoProducao,
  producaoAtual,
  setNomeCondutaSelecionada,
  nomeCondutaSelecionada,
}) => {
  const acessosOrdenados = [...acessos].sort((a, b) => {
    const nomeA = a.nome?.trim().toUpperCase();
    const nomeB = b.nome?.trim().toUpperCase();

    if (nomeA === 'SEM ACESSO') {
      return -1;
    }

    if (nomeB === 'SEM ACESSO') {
      return 1;
    }

    return a.nome.localeCompare(b.nome);
  });

  return (
    <Modal show={showProducaoModal} onHide={handleCloseProducaoModal} size="lg" centered dialogClassName="app-modal">
      <Modal.Header closeButton>
        <Modal.Title>{modoEdicaoProducao ? 'Editar producao' : `Producoes de ${pacienteAtual?.nome || 'paciente'}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body-scroll">
        <Form key={modoEdicaoProducao ? producaoAtual?.id || 'editando' : 'novo'} onSubmit={handleSubmitProducao}>
          <div className="form-grid">
            <Form.Group className="field">
              <Form.Label>Acesso</Form.Label>
              <Form.Select name="nomeAcesso" defaultValue={producaoAtual?.acesso?.nome || ''} required>
                <option value="">Selecione um acesso</option>
                {acessosOrdenados.map(acesso => (
                  <option key={acesso.id} value={acesso.nome}>
                    {acesso.nome}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="field">
              <Form.Label>Data do acesso</Form.Label>
              <Form.Control type="date" name="dataAcesso" defaultValue={producaoAtual?.acesso?.data || ''} />
            </Form.Group>

            <Form.Group className="field">
              <Form.Label>Conduta</Form.Label>
              <Form.Select
                name="nomeConduta"
                value={modoEdicaoProducao ? nomeCondutaSelecionada : undefined}
                defaultValue={!modoEdicaoProducao ? '' : undefined}
                onChange={modoEdicaoProducao ? event => setNomeCondutaSelecionada(event.target.value) : undefined}
                required
              >
                <option value="">Selecione uma conduta</option>
                {[...condutas].sort((a, b) => a.nome.localeCompare(b.nome)).map(conduta => (
                  <option key={conduta.id} value={conduta.nome}>
                    {conduta.nome}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="field">
              <Form.Label>Producao</Form.Label>
              <Form.Select name="nomeProducao" defaultValue={producaoAtual?.producao?.nome || ''} required>
                <option value="">Selecione uma producao</option>
                {producoes.map(producao => (
                  <option key={producao.id} value={producao.nome}>
                    {producao.nome}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="field">
              <Form.Label>Data da producao</Form.Label>
              <Form.Control type="date" name="dataProducao" defaultValue={producaoAtual?.criada_em || ''} required />
            </Form.Group>

            <Form.Group className="field field-align-end">
              <Form.Check type="switch" label="Usou cateter" name="usouCateter" defaultChecked={producaoAtual?.usou_cateter || false} />
            </Form.Group>
          </div>

          <div className="modal-actions">
            <Button variant="light" onClick={handleCloseProducaoModal}>
              Fechar
            </Button>
            <Button variant={modoEdicaoProducao ? 'warning' : 'primary'} type="submit">
              {modoEdicaoProducao ? 'Salvar edicao' : 'Adicionar producao'}
            </Button>
          </div>
        </Form>

        {!modoEdicaoProducao && (
          <>
            <div className="section-heading section-heading--spaced">
              <span className="eyebrow">Historico</span>
              <h3>Ultimas producoes registradas</h3>
            </div>

            <div className="timeline-list">
              {historicoProducoes.length ? (
                historicoProducoes.map((item, index) => (
                  <article key={`${item.criada_em || 'producao'}-${index}`} className="timeline-item">
                    <div className="timeline-item__meta">
                      <strong>{item.producao?.nome || 'Producao sem nome'}</strong>
                      <span>{formatarData(item.criada_em)}</span>
                    </div>
                    <p>
                      <strong>Conduta:</strong> {item.conduta?.nome || 'Nao informada'}
                    </p>
                    <p>
                      <strong>Acesso:</strong> {item.acesso?.nome || 'Nao informado'}
                      {item.acesso?.data ? ` em ${formatarData(item.acesso.data)}` : ''}
                    </p>
                    <p>
                      <strong>Cateter:</strong> {item.usou_cateter ? 'Sim' : 'Nao'}
                    </p>
                    <p className="timeline-author">{item.user || 'Usuario nao identificado'}</p>
                    {item.user === currentUser?.email && (
                      <Button variant="outline-warning" size="sm" onClick={() => editarProducao(item)}>
                        Editar
                      </Button>
                    )}
                  </article>
                ))
              ) : (
                <div className="state-card state-card--compact">
                  <p>Nenhuma producao registrada para este paciente.</p>
                </div>
              )}
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};
