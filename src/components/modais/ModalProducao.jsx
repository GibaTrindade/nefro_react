import {Button, Modal, Form } from 'react-bootstrap';

export const ModalProducao = ({
    showProducaoModal, 
    handleCloseProducaoModal, 
    handleSubmitProducao,
    editarProducao,
    pacienteAtual,
    acessos, 
    condutas, 
    producoes,
    currentUser,
    modoEdicaoProducao,
    producaoAtual,
    setNomeCondutaSelecionada,
    nomeCondutaSelecionada
}) => {

    // const formatarData = (data) => {
    //     //const data = timestamp.toDate();
    //     return data.toISOString().split('T')[0]; // Formato yyyy-MM-dd
    //   };


    return (

    <Modal show={showProducaoModal} onHide={handleCloseProducaoModal}>
        <Modal.Header closeButton>
          <Modal.Title>Detalhes da Produção</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: 'calc(100vh - 210px)', overflowY: 'auto' }}>
        {modoEdicaoProducao ? (
            <Form onSubmit={handleSubmitProducao}>
            {/* Campo para Acesso */}
            <Form.Group className="mb-3">
            <></>
              <Form.Label>Acesso</Form.Label>
              <Form.Select name="nomeAcesso" defaultValue={producaoAtual?.acesso?.nome} required>
              <option value="">Selecione um Acesso</option>
                {acessos.sort((a, b) => a.nome.localeCompare(b.nome)).map(acesso => (
                  <option key={acesso.id} value={acesso.nome}>{acesso.nome}</option>
                ))}
              </Form.Select>
              <Form.Label>Data do Acesso</Form.Label>
              <></>
              <Form.Control type="date" 
                            name="dataAcesso" 
                            defaultValue={producaoAtual?.acesso?.data ? producaoAtual.acesso.data : ''} 
                            />
            </Form.Group>

            {/* Campo para Conduta */}
            <Form.Group className="mb-3">
            
              <Form.Label>Conduta</Form.Label>
              <Form.Select 
              name="nomeConduta" 
              value={nomeCondutaSelecionada} 
              onChange={(e) => setNomeCondutaSelecionada(e.target.value)} 
              required>
                <option value="">Selecione uma Conduta</option>
                {condutas.sort((a, b) => a.nome.localeCompare(b.nome)).map(conduta => (
                  <option key={conduta.id} value={conduta.nome}>{conduta.nome}</option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Campo para Nome da Produção */}
            <Form.Group className="mb-3">
            <></>
              <Form.Label>Produção</Form.Label>
              <Form.Select name="nomeProducao" defaultValue={producaoAtual?.producao?.nome} required>
                <option value="">Selecione uma Produção</option>
                {producoes.map(producao => (
                  <option key={producao.id} value={producao.nome}>{producao.nome}</option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Campo para Usou Cateter */}
            <Form.Group className="mb-3">
            <></>
              <Form.Check 
                type="checkbox" 
                label="Usou Cateter?" 
                name="usouCateter"
                defaultChecked={producaoAtual?.usou_cateter}

              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Data da Produção</Form.Label>
              <></>
              <Form.Control type="date" 
                            name="dataProducao" 
                            defaultValue={producaoAtual?.criada_em ? producaoAtual.criada_em : ''} 
                            required
                            />
            </Form.Group>

            {/* Botão para Submeter o Formulário */}
            <Button variant="warning" type="submit">Editar Produção</Button>
          </Form>
          
        ) : (<>
            <Form onSubmit={handleSubmitProducao}>
            {/* Campo para Acesso */}
            <Form.Group className="mb-3">
              <Form.Label>Acesso</Form.Label>
              <Form.Select name="nomeAcesso" required>
              <option value="">Selecione um Acesso</option>
                {acessos.sort((a, b) => a.nome.localeCompare(b.nome)).map(acesso => (
                  <option key={acesso.id} value={acesso.nome}>{acesso.nome}</option>
                ))}
              </Form.Select>
              <Form.Label>Data do Acesso</Form.Label>
              <Form.Control type="date" name="dataAcesso"/>
            </Form.Group>

            {/* Campo para Conduta */}
            <Form.Group className="mb-3">
              <Form.Label>Conduta</Form.Label>
              <Form.Select name="nomeConduta" required>
              <option value="">Selecione uma Conduta</option>
                {condutas.sort((a, b) => a.nome.localeCompare(b.nome)).map(conduta => (
                  <option key={conduta.id} value={conduta.nome}>{conduta.nome}</option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Campo para Nome da Produção */}
            <Form.Group className="mb-3">
              <Form.Label>Produção</Form.Label>
              <Form.Select name="nomeProducao" required>
              <option value="">Selecione uma Produção</option>
                {producoes.map(producao => (
                  <option key={producao.id} value={producao.nome}>{producao.nome}</option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Campo para Usou Cateter */}
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox" 
                label="Usou Cateter?" 
                name="usouCateter"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Data da Produção</Form.Label>
              <></>
              <Form.Control type="date" 
                            name="dataProducao" 
                            required
                            />
            </Form.Group>

            {/* Botão para Submeter o Formulário */}
            <Button variant="primary" type="submit" className="mb-2">Adicionar Produção</Button>
          </Form>
          <hr/>
          <h3 className="mb-3">Histórico de Produções</h3>
            { pacienteAtual && 
              pacienteAtual.producao && 
              pacienteAtual.producao.sort((a, b) => new Date(a.criada_em) - new Date(b.criada_em)).map((item, index) => (
            
                <div key={index} className="border p-3 mb-3 rounded">
                  <p className="text-muted">Usuário: {item.user}</p>
                  {item.acesso && (
                    <p><strong>Acesso:</strong> {item.acesso.nome} {item.acesso.data ? `em ${item.acesso.data}` : ''}</p>
                  )}
                  {item.conduta && (
                    <p><strong>Conduta:</strong> {item.conduta.nome}</p>
                  )}
                  {item.producao && (
                    <p><strong>Produção:</strong> {item.producao.nome}</p>
                  )}
                  {(
                    <p><strong>Usou Cateter:</strong> {item.usou_cateter ? 'Sim' : 'Não'}</p>
                  )}
                  {item.criada_em && (
                    <p><strong>Criada em:</strong> {item.criada_em}</p>
                  )}
                  {item.user === currentUser.email && (
                        <Button variant="warning" onClick={() => editarProducao(item, index)}>
                        Editar
                        </Button>
                    )}
                </div>
              ))}
                </>

        )}
          
        </Modal.Body>
      </Modal>
    )
}