import { Accordion } from 'react-bootstrap';
import { FaFileMedical, FaNotesMedical, FaPencilAlt } from 'react-icons/fa';

const getLastEvolution = paciente => {
  if (paciente.ultima_evolucao_texto) {
    return paciente.ultima_evolucao_texto;
  }

  const evolucoes = paciente.evolucao || [];
  return evolucoes.length ? evolucoes[evolucoes.length - 1].texto : 'Sem evolucoes registradas.';
};

export const ListaPacientes = ({ pacientes, abrirModalEdicao, abrirModalProducao, abrirModalEvolucao, busca }) => {
  const hospitais = Object.entries(pacientes || {});

  if (!hospitais.length) {
    return (
      <section className="state-card">
        <h3>Nenhum paciente encontrado</h3>
        <p>
          {busca
            ? 'Tente ajustar a busca ou limpar os filtros para ver outros pacientes.'
            : 'Quando novos pacientes entrarem na base, eles aparecerao aqui.'}
        </p>
      </section>
    );
  }

  return (
    <section className="patient-section">
      <div className="section-heading">
        <span className="eyebrow">Pacientes</span>
        <h2>Lista organizada por hospital</h2>
        <p>Abra um hospital para ver os cards resumidos e agir rapido em cada paciente.</p>
      </div>

      <Accordion alwaysOpen className="hospital-accordion">
        {hospitais.map(([hospitalNome, pacientesDoHospital]) => (
          <Accordion.Item eventKey={hospitalNome} key={hospitalNome} className="hospital-item">
            <Accordion.Header>
              <div className="accordion-title-wrap">
                <strong>{hospitalNome}</strong>
                <span>{pacientesDoHospital.length} paciente(s)</span>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <div className="patient-grid">
                {pacientesDoHospital.map(paciente => (
                  <article key={paciente.id} className="patient-card">
                    <div className="patient-card__header">
                      <div>
                        <h3>{paciente.nome}</h3>
                        <p>
                          {paciente.setor || 'Setor nao informado'} - Registro {paciente.registro || 'sem registro'}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => abrirModalEdicao(paciente)}
                        aria-label={`Editar ${paciente.nome}`}
                      >
                        <FaPencilAlt />
                      </button>
                    </div>

                    <div className="badge-row">
                      <span className={`soft-badge ${paciente.alta ? 'soft-badge--warning' : 'soft-badge--success'}`}>
                        {paciente.alta ? 'Alta' : 'Ativo'}
                      </span>
                      <span className="soft-badge">{paciente.convenio || 'Sem convenio'}</span>
                      <span className="soft-badge">{paciente.idade ? `${paciente.idade} anos` : 'Idade nao informada'}</span>
                    </div>

                    <dl className="patient-details">
                      <div>
                        <dt>Diagnostico</dt>
                        <dd>{paciente.diagnostico?.join(', ') || 'Nao informado'}</dd>
                      </div>
                      <div>
                        <dt>Ultima evolucao</dt>
                        <dd>{getLastEvolution(paciente)}</dd>
                      </div>
                    </dl>

                    <div className="patient-actions">
                      <button type="button" className="button button-secondary button-block" onClick={() => abrirModalProducao(paciente)}>
                        <FaFileMedical />
                        <span>Producoes</span>
                      </button>
                      <button type="button" className="button button-ghost button-block" onClick={() => abrirModalEvolucao(paciente)}>
                        <FaNotesMedical />
                        <span>Evolucoes</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </section>
  );
};
