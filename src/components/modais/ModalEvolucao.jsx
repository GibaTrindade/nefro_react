import {Button, Modal, Form } from 'react-bootstrap';

export const ModalEvolucao = ({
    showEvolucaoModal, 
    handleCloseEvolucaoModal, 
    evolucoes, 
    adicionarEvolucao, 
    setTextoEvolucao}) => {


    return (

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
            <Form onSubmit={adicionarEvolucao}>
                <Form.Group className="mb-3">
                <Form.Label>Evolução</Form.Label>
                <div style={{ display: 'flex' }}>
                    <Form.Control type="text" 
                                    placeholder="Digite a evolução" 
                                    onChange={(e) => setTextoEvolucao(e.target.value)} 
                                    required />
                    <Button variant="success" type='submit' style={{ marginLeft: '10px' }} >
                    + Evolução
                    </Button>
                </div>
                </Form.Group>
            </Form>
            </Modal.Body>
      </Modal>
    )
}