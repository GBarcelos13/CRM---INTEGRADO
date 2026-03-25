-- ============================================================
-- CRM MUG SOLUTIONS — Schema + Seed Data
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- ─── TABELAS ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  company     TEXT,
  origin      TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'novo',
  value       NUMERIC DEFAULT 0,
  tags        TEXT[] DEFAULT '{}',
  assignee    TEXT,
  avatar      TEXT,
  last_contact TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interactions (
  id          TEXT PRIMARY KEY,
  lead_id     TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  description TEXT,
  date        TIMESTAMPTZ NOT NULL,
  user_name   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  lead_id     TEXT REFERENCES leads(id) ON DELETE SET NULL,
  lead_name   TEXT,
  due_date    TIMESTAMPTZ NOT NULL,
  completed   BOOLEAN DEFAULT FALSE,
  priority    TEXT NOT NULL DEFAULT 'media',
  type        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DESABILITAR RLS (app interno sem autenticação) ─────────

ALTER TABLE leads        DISABLE ROW LEVEL SECURITY;
ALTER TABLE interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks        DISABLE ROW LEVEL SECURITY;

-- ─── SEED — LEADS ───────────────────────────────────────────

INSERT INTO leads (id, name, email, phone, company, origin, status, value, tags, assignee, avatar, last_contact, created_at) VALUES
('lead-001', 'Fernanda Oliveira', 'fernanda.oliveira@techsolutions.com.br', '(11) 99234-5678', 'Tech Solutions Ltda',   'linkedin',  'proposta',        18500, ARRAY['enterprise','software','urgente'],          'Ana Silva',   'FO', '2026-03-21T10:30:00Z', '2026-02-15T08:00:00Z'),
('lead-002', 'Ricardo Mendes',    'ricardo@construtoravalor.com.br',        '(21) 98765-4321', 'Construtora Valor',      'indicacao', 'em_atendimento',  32000, ARRAY['construcao','b2b','alto-valor'],             'Carlos Souza','RM', '2026-03-10T16:00:00Z', '2026-03-01T09:00:00Z'),
('lead-003', 'Camila Ferreira',   'camila.ferreira@marketingpro.com.br',    '(31) 97654-3210', 'Marketing Pro Agency',   'instagram', 'novo',             8900, ARRAY['agencia','marketing','smb'],                'Ana Silva',   'CF', '2026-03-20T11:00:00Z', '2026-03-20T11:00:00Z'),
('lead-004', 'Bruno Almeida',     'bruno.almeida@logisticamax.com.br',      '(11) 94567-8901', 'LogísticaMax',           'site',      'fechado_ganho',   45000, ARRAY['logistica','enterprise','fechado'],          'Carlos Souza','BA', '2026-03-18T10:00:00Z', '2026-01-10T08:00:00Z'),
('lead-005', 'Juliana Costa',     'juliana.costa@clinicavida.com.br',       '(41) 93456-7890', 'Clínica Vida Saúde',     'evento',    'em_atendimento',  12000, ARRAY['saude','clinica','smb'],                    'Ana Silva',   'JC', '2026-03-08T14:00:00Z', '2026-03-05T09:00:00Z'),
('lead-006', 'Marcos Rodrigues',  'marcos@grupoalpha.com.br',               '(11) 92345-6789', 'Grupo Alpha Investimentos','linkedin', 'proposta',        78000, ARRAY['financeiro','enterprise','vip','alto-valor'],'Ana Silva',   'MR', '2026-03-12T09:00:00Z', '2026-02-01T08:00:00Z'),
('lead-007', 'Patrícia Lima',     'patricia.lima@ecommercebrasil.com.br',   '(11) 91234-5678', 'E-Commerce Brasil',      'whatsapp',  'novo',             6500, ARRAY['ecommerce','varejo','smb'],                 'Carlos Souza','PL', '2026-03-05T10:00:00Z', '2026-03-05T10:00:00Z'),
('lead-008', 'Eduardo Santos',    'eduardo@consultoriaes.com.br',           '(51) 98901-2345', 'ES Consultoria',         'indicacao', 'fechado_perdido', 15000, ARRAY['consultoria','perdido'],                    'Carlos Souza','ES', '2026-02-28T15:00:00Z', '2026-01-20T08:00:00Z'),
('lead-009', 'Vanessa Carvalho',  'vanessa@rededucacao.com.br',             '(61) 97890-1234', 'Rede Educação Digital',  'site',      'em_atendimento',  22000, ARRAY['educacao','b2b','medio'],                   'Ana Silva',   'VC', '2026-03-11T13:00:00Z', '2026-02-25T08:00:00Z'),
('lead-010', 'Rafael Gomes',      'rafael.gomes@industrias-pg.com.br',      '(19) 96789-0123', 'Indústrias PG',          'linkedin',  'novo',            54000, ARRAY['industria','manufatura','enterprise'],       'Carlos Souza','RG', '2026-03-01T09:00:00Z', '2026-03-01T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ─── SEED — INTERACTIONS ────────────────────────────────────

INSERT INTO interactions (id, lead_id, type, description, date, user_name) VALUES
('int-001-1','lead-001','call',   'Ligação inicial de qualificação. Cliente demonstrou interesse nos planos enterprise.','2026-02-15T14:00:00Z','Ana Silva'),
('int-001-2','lead-001','email',  'Enviei apresentação da empresa e cases de sucesso no setor de tecnologia.','2026-02-18T09:15:00Z','Ana Silva'),
('int-001-3','lead-001','meeting','Reunião de demo online. Apresentei todas as funcionalidades. Cliente ficou muito interessado.','2026-03-01T15:00:00Z','Ana Silva'),
('int-001-4','lead-001','whatsapp','Cliente perguntou sobre integração com sistema legado. Respondi e agendei call técnico.','2026-03-10T11:00:00Z','Ana Silva'),
('int-001-5','lead-001','email',  'Enviei proposta comercial detalhada com 3 opções de plano. Aguardando retorno.','2026-03-21T10:30:00Z','Ana Silva'),

('int-002-1','lead-002','whatsapp','Primeiro contato via WhatsApp após indicação do cliente Grupo Alpha.','2026-03-01T09:00:00Z','Carlos Souza'),
('int-002-2','lead-002','call',   'Ligação de qualificação. Empresa tem 50 funcionários e precisa de gestão completa.','2026-03-05T14:00:00Z','Carlos Souza'),
('int-002-3','lead-002','meeting','Visita presencial ao escritório. Mapeei todas as necessidades. Decisor é o CEO.','2026-03-10T16:00:00Z','Carlos Souza'),

('int-003-1','lead-003','whatsapp','Lead entrou via Instagram DM. Preencheu formulário no link da bio. Aguarda contato.','2026-03-20T11:00:00Z','Sistema'),

('int-004-1','lead-004','call',   'Primeiro contato. Lead veio pelo formulário do site. Empresa de médio porte.','2026-01-10T14:00:00Z','Carlos Souza'),
('int-004-2','lead-004','meeting','Demo completa do produto. Equipe técnica participou.','2026-01-25T10:00:00Z','Carlos Souza'),
('int-004-3','lead-004','email',  'Proposta enviada com desconto especial para contrato anual.','2026-02-01T09:00:00Z','Carlos Souza'),
('int-004-4','lead-004','note',   'Cliente assinou contrato! Valor: R$ 45.000 anuais. Início do onboarding em 01/04.','2026-03-18T10:00:00Z','Carlos Souza'),

('int-005-1','lead-005','meeting','Conheci no evento HealthTech BH. Muito interessada na solução para clínicas.','2026-03-05T09:00:00Z','Ana Silva'),
('int-005-2','lead-005','call',   'Ligação de follow-up pós evento. Agendei demo para semana que vem.','2026-03-08T14:00:00Z','Ana Silva'),

('int-006-1','lead-006','email',  'Contato inicial via LinkedIn. Enviou mensagem pedindo informações sobre planos enterprise.','2026-02-01T08:00:00Z','Ana Silva'),
('int-006-2','lead-006','meeting','Reunião no escritório deles. Participaram o CEO e o diretor de TI.','2026-02-20T10:00:00Z','Ana Silva'),
('int-006-3','lead-006','email',  'Proposta customizada enviada. Inclui módulos extras de BI e relatórios avançados.','2026-03-05T09:00:00Z','Ana Silva'),
('int-006-4','lead-006','call',   'Ligação para esclarecer dúvidas técnicas da proposta. Estão em fase de aprovação interna.','2026-03-12T09:00:00Z','Ana Silva'),

('int-007-1','lead-007','whatsapp','Entrou em contato via WhatsApp business. Quer saber sobre integração com e-commerce.','2026-03-05T10:00:00Z','Sistema'),

('int-008-1','lead-008','call',   'Ligação de qualificação. Empresa pequena com 5 funcionários.','2026-01-20T10:00:00Z','Carlos Souza'),
('int-008-2','lead-008','meeting','Demo online realizada. Gostou do produto mas achou o preço elevado.','2026-02-10T14:00:00Z','Carlos Souza'),
('int-008-3','lead-008','note',   'Cliente optou por solução concorrente mais barata. Negociação encerrada.','2026-02-28T15:00:00Z','Carlos Souza'),

('int-009-1','lead-009','email',  'Lead veio pelo blog. Baixou e-book e cadastrou email. Nutrição automática iniciada.','2026-02-25T08:00:00Z','Sistema'),
('int-009-2','lead-009','call',   'Ligação de qualificação. Rede com 12 escolas parceiras. Orçamento aprovado.','2026-03-03T10:00:00Z','Ana Silva'),
('int-009-3','lead-009','meeting','Demo para equipe pedagógica e de TI. Ótima receptividade.','2026-03-11T13:00:00Z','Ana Silva'),

('int-010-1','lead-010','email',  'Conectou no LinkedIn e enviou mensagem. Grande empresa industrial com 200+ funcionários.','2026-03-01T09:00:00Z','Carlos Souza')
ON CONFLICT (id) DO NOTHING;

-- ─── SEED — TASKS ───────────────────────────────────────────

INSERT INTO tasks (id, title, lead_id, lead_name, due_date, completed, priority, type) VALUES
('task-001','Ligar para Fernanda Oliveira para follow-up da proposta',      'lead-001','Fernanda Oliveira','2026-03-22T09:00:00Z',false,'alta',  'ligacao'),
('task-002','Enviar contrato revisado para Marcos Rodrigues',               'lead-006','Marcos Rodrigues', '2026-03-22T14:00:00Z',false,'alta',  'email'),
('task-003','Agendar demo com Ricardo Mendes (CEO e equipe)',               'lead-002','Ricardo Mendes',   '2026-03-15T10:00:00Z',false,'alta',  'reuniao'),
('task-004','Follow-up Juliana Costa — sem resposta há 14 dias',           'lead-005','Juliana Costa',    '2026-03-14T09:00:00Z',false,'media', 'follow_up'),
('task-005','Ligar para Patrícia Lima — novo lead WhatsApp',               'lead-007','Patrícia Lima',    '2026-03-10T11:00:00Z',false,'media', 'ligacao'),
('task-006','Preparar relatório mensal de pipeline para reunião de vendas', NULL,      NULL,               '2026-03-22T16:00:00Z',false,'media', 'reuniao'),
('task-007','Enviar case de sucesso LogísticaMax para Rafael Gomes',       'lead-010','Rafael Gomes',     '2026-03-25T10:00:00Z',false,'media', 'email'),
('task-008','Reunião de onboarding com Bruno Almeida — LogísticaMax',      'lead-004','Bruno Almeida',    '2026-03-28T14:00:00Z',false,'alta',  'reuniao'),
('task-009','Ligar para Vanessa Carvalho para apresentar proposta',        'lead-009','Vanessa Carvalho', '2026-03-20T10:00:00Z',true, 'alta',  'ligacao'),
('task-010','Enviar email de boas-vindas para Camila Ferreira',            'lead-003','Camila Ferreira',  '2026-03-21T09:00:00Z',true, 'baixa', 'email')
ON CONFLICT (id) DO NOTHING;
