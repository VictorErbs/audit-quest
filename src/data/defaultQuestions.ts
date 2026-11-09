import { Question } from '../types/game';
import { QUALITY_QUESTIONS } from './qualityQuestions';

export const INITIAL_QUESTIONS: Question[] = [
  ...QUALITY_QUESTIONS,
  // =========================================================================
  // NÍVEL 1 (FÁCIL) — CONCENTRAÇÃO DE MERCADO & FOCO DOS REGULADORES
  // Fonte: Crepaldi, Silvio Aparecido. Auditoria Contábil, Item 4.10, pág. 149
  // =========================================================================
  {
    id: 'q-410-1',
    category: 'CONCENTRACAO',
    levelNumber: 1,
    difficulty: 'FACIL',
    title: 'Medidas dos Reguladores Internacionais',
    documentType: 'RELATORIO',
    scenario: 'Os órgãos reguladores internacionais consideram que a falta de transparência das auditorias é uma questão que tem de ser atacada e estudam adotar uma série de medidas para aumentar o nível de divulgação sobre a estrutura das firmas do setor.',
    prompt: 'De acordo com o item 4.10, sobre quais aspectos os reguladores internacionais estudam adotar medidas para aumentar o nível de divulgação por parte das firmas de auditoria?',
    normReference: 'Livro Auditoria Contábil (Prof. Crepaldi) — Item 4.10, pág. 149',
    didacticTip: 'O texto cita expressamente três aspectos estruturais: estrutura de governança, controle de qualidade e informações financeiras.',
    points: 200,
    options: [
      {
        id: 'q1-opt-a',
        text: 'Estrutura de governança, controle de qualidade e informações financeiras das firmas do setor.',
        isCorrect: true,
        explanation: 'Exato! O item 4.10 afirma textualmente que os órgãos reguladores estudam medidas para aumentar a divulgação sobre estrutura de governança, controle de qualidade e informações financeiras.'
      },
      {
        id: 'q1-opt-b',
        text: 'Apenas a lista de clientes inadimplentes e a tabela salarial dos estagiários.',
        isCorrect: false,
        explanation: 'Incorreto. O foco regulatório está na solidez estrutural: governança, controle de qualidade e saúde financeira.'
      },
      {
        id: 'q1-opt-c',
        text: 'Exclusivamente estratégias de marketing comercial e segredos industriais dos clientes auditados.',
        isCorrect: false,
        explanation: 'Incorreto. O sigilo dos clientes é preservado e marketing não é o foco dos reguladores.'
      },
      {
        id: 'q1-opt-d',
        text: 'Dispensa de cumprimento de normas técnicas e isenção tributária para as firmas.',
        isCorrect: false,
        explanation: 'Incorreto. Reguladores buscam elevar a conformidade e a transparência, não conceder dispensas ou isenções.'
      }
    ]
  },
  {
    id: 'q-410-2',
    category: 'CONCENTRACAO',
    levelNumber: 1,
    difficulty: 'FACIL',
    title: 'Concentração de Mercado das Quatro Maiores',
    documentType: 'PLANILHA',
    scenario: 'É importante ter informações sobre a qualidade do trabalho das auditorias e sobre a saúde financeira delas, especialmente diante da forte concentração nas quatro maiores empresas do setor: PwC, Deloitte, Ernst & Young e KPMG.',
    prompt: 'Segundo os dados apresentados no item 4.10, qual é a proporção de empresas auditadas pelas quatro maiores nos EUA, no Reino Unido e no Brasil?',
    normReference: 'Livro Auditoria Contábil (Prof. Crepaldi) — Item 4.10, pág. 149',
    didacticTip: 'Conforme dados do texto: 98% das 1,5 mil maiores (EUA), 96% das 250 maiores (Reino Unido) e 58% das abertas (Brasil).',
    points: 200,
    options: [
      {
        id: 'q2-opt-a',
        text: '98% das 1,5 mil maiores empresas dos EUA, 96% das 250 maiores do Reino Unido e 58% entre companhias abertas no Brasil.',
        isCorrect: true,
        explanation: 'Correto! Os números do item 4.10 comprovam a elevada dependência do mercado financeiro global e brasileiro em relação às Big Four.'
      },
      {
        id: 'q2-opt-b',
        text: '50% das empresas dos EUA, 50% no Reino Unido e apenas 10% no Brasil.',
        isCorrect: false,
        explanation: 'Incorreto. A concentração real relatada pelo autor é muito superior a esses percentuais.'
      },
      {
        id: 'q2-opt-c',
        text: '100% no Brasil, 75% nos EUA e 60% no Reino Unido.',
        isCorrect: false,
        explanation: 'Incorreto. No Brasil a concentração é de 58%, enquanto nos EUA e no Reino Unido supera 95%.'
      },
      {
        id: 'q2-opt-d',
        text: '85% em todos os países uniformemente, sem qualquer diferença entre mercados emergentes e desenvolvidos.',
        isCorrect: false,
        explanation: 'Incorreto. Há discrepância significativa documentada: 98% (EUA), 96% (Reino Unido) e 58% (Brasil).'
      }
    ]
  },

  // =========================================================================
  // NÍVEL 2 (MÉDIO) — AS QUATRO ÁREAS DE DIVULGAÇÃO E ACEITAÇÃO
  // Fonte: Crepaldi, Silvio Aparecido. Auditoria Contábil, Item 4.10, pág. 150
  // =========================================================================
  {
    id: 'q-410-3',
    category: 'DIVULGACAO',
    levelNumber: 2,
    difficulty: 'MEDIO',
    title: 'As Quatro Áreas de Informações Divulgáveis',
    documentType: 'MEMORANDO',
    scenario: 'Na lista de informações que poderiam ser divulgadas aos reguladores e ao público, o item 4.10 estabelece uma divisão didática e estruturada das informações do setor de auditoria.',
    prompt: 'Conforme o item 4.10, em quais quatro áreas é possível dividir a lista de informações que poderiam ser divulgadas pelas auditorias?',
    normReference: 'Livro Auditoria Contábil (Prof. Crepaldi) — Item 4.10, pág. 150',
    didacticTip: 'O autor divide a lista em: governança e controle; pessoal e treinamento; indicadores do resultado do trabalho; e informações financeiras.',
    points: 200,
    options: [
      {
        id: 'q3-opt-a',
        text: 'Governança e controle; Pessoal e treinamento; Indicadores do resultado do trabalho; e Informações financeiras.',
        isCorrect: true,
        explanation: 'Correto! Essa é a exata divisão em quatro grupos apresentada no item 4.10 do livro.'
      },
      {
        id: 'q3-opt-b',
        text: 'Planejamento tributário; Publicidade e propaganda; Custos com softwares de TI; e Frotas de veículos.',
        isCorrect: false,
        explanation: 'Incorreto. A divisão do item 4.10 foca em governança, equipe/treinamento, resultados técnicos e finanças da firma.'
      },
      {
        id: 'q3-opt-c',
        text: 'Comissões de vendas; Recrutamento de executivos; Contratos de terceirização; e Benefícios trabalhistas.',
        isCorrect: false,
        explanation: 'Incorreto. Esses itens operacionais não compõem a divisão quadridimensional estabelecida pelos reguladores.'
      },
      {
        id: 'q3-opt-d',
        text: 'Vendas de consultoria; Pareceres sem ressalva; Honorários por hora; e Segredos corporativos.',
        isCorrect: false,
        explanation: 'Incorreto. Essa classificação não existe no texto normativo de Crepaldi.'
      }
    ]
  },
  {
    id: 'q-410-4',
    category: 'DIVULGACAO',
    levelNumber: 2,
    difficulty: 'MEDIO',
    title: 'Áreas de Divulgação Aceitas pelas Auditorias',
    documentType: 'PARECER',
    scenario: 'Ao debater a ampliação da transparência com os órgãos reguladores, as firmas de auditoria não apresentam a mesma postura para todos os quatro grupos de informações.',
    prompt: 'De acordo com o item 4.10, sobre quais grupos as auditorias de forma geral NÃO veem problemas em divulgar mais informações, e qual o motivo?',
    normReference: 'Livro Auditoria Contábil (Prof. Crepaldi) — Item 4.10, pág. 150',
    didacticTip: 'Consulte o texto: auditorias não veem problemas nos dois primeiros grupos (governança e pessoal) por estarem diretamente ligadas à qualidade.',
    points: 200,
    options: [
      {
        id: 'q4-opt-a',
        text: 'Sobre governança e pessoal, porque acreditam que estão mais diretamente ligadas à avaliação da qualidade da auditoria.',
        isCorrect: true,
        explanation: 'Exato! O texto diz: "De forma geral, as auditorias não veem problemas em divulgar mais informações sobre os dois primeiros grupos, sobre governança e pessoal, que acreditam estar mais diretamente ligadas à avaliação da qualidade da auditoria".'
      },
      {
        id: 'q4-opt-b',
        text: 'Sobre informações financeiras e seus lucros, porque visam atrair mais investidores para a firma.',
        isCorrect: false,
        explanation: 'Incorreto. Informações financeiras encontram forte resistência, e não aceitação.'
      },
      {
        id: 'q4-opt-c',
        text: 'Sobre litígios judiciais e processos disciplinares, porque atestam transparência punitiva imediata.',
        isCorrect: false,
        explanation: 'Incorreto. Indicadores de litígios e processos disciplinares são alvos de severa resistência pelas firmas.'
      },
      {
        id: 'q4-opt-d',
        text: 'As auditorias rejeitam sumariamente a divulgação de qualquer dado sobre os quatro grupos.',
        isCorrect: false,
        explanation: 'Incorreto. As firmas aceitam divulgar dados de governança e pessoal/capacitação.'
      }
    ]
  },

  // =========================================================================
  // NÍVEL 3 (DIFÍCIL) — RESISTÊNCIA À DIVULGAÇÃO & RISCO SISTÊMICO
  // Fonte: Crepaldi, Silvio Aparecido. Auditoria Contábil, Item 4.10, pág. 150
  // =========================================================================
  {
    id: 'q-410-5',
    category: 'RESISTENCIA_RISCO',
    levelNumber: 3,
    difficulty: 'DIFICIL',
    title: 'Pontos de Maior Resistência das Auditorias',
    documentType: 'DOSSIE',
    scenario: 'Apesar de concordarem com a divulgação de governança e capacitação da equipe, os reguladores internacionais e locais enfrentam barreiras concretas ao exigir dados de áreas críticas das auditorias.',
    prompt: 'Quais são as informações apontadas no item 4.10 em que há MAIOR RESISTÊNCIA por parte das auditorias em fornecer aos reguladores e ao público?',
    normReference: 'Livro Auditoria Contábil (Prof. Crepaldi) — Item 4.10, pág. 150',
    didacticTip: 'Releia o trecho final do item 4.10: informações financeiras (balanço próprio) e indicadores do resultado (litígios, processos disciplinares, recusa de clientes e balanços republicados).',
    points: 200,
    options: [
      {
        id: 'q5-opt-a',
        text: 'Informações financeiras (como balanço auditado das próprias auditorias) e indicadores do resultado (litígios judiciais, processos disciplinares, aceitação e rejeição de clientes e número de balanços republicados).',
        isCorrect: true,
        explanation: 'Correto! O texto explicita a resistência a fornecer balanço próprio auditado, litígios judiciais, procedimentos disciplinares, estatísticas de rejeição de clientes e quantidade de balanços que tiveram de ser republicados.'
      },
      {
        id: 'q5-opt-b',
        text: 'Horas de treinamento da equipe técnica e certificados acadêmicos dos sócios responsáveis.',
        isCorrect: false,
        explanation: 'Incorreto. Dados de treinamento e pessoal fazem parte do grupo que as auditorias não veem problemas em divulgar.'
      },
      {
        id: 'q5-opt-c',
        text: 'Apenas a divulgação do organograma institucional e do código de ética da firma.',
        isCorrect: false,
        explanation: 'Incorreto. Governança e código ético são amplamente aceitos para divulgação pública.'
      },
      {
        id: 'q5-opt-d',
        text: 'O endereço físico de suas filiais regionais e o tempo de constituição legal do CNPJ.',
        isCorrect: false,
        explanation: 'Incorreto. Essas são informações públicas básicas cadastrais e sem qualquer oposição.'
      }
    ]
  },
  {
    id: 'q-410-6',
    category: 'RESISTENCIA_RISCO',
    levelNumber: 3,
    difficulty: 'DIFICIL',
    title: 'Risco Sistêmico e Falta de Oferta de Serviço',
    documentType: 'RELATORIO',
    scenario: 'A concentração do mercado de auditoria em apenas quatro corporações gigantescas gera um debate crítico entre órgãos reguladores que vai além da exigência de transparência contábil.',
    prompt: 'Qual dúvida e risco crítico para grandes corporações são apontados no item 4.10 em decorrência da alta concentração nas Big Four?',
    normReference: 'Livro Auditoria Contábil (Prof. Crepaldi) — Item 4.10, pág. 150',
    didacticTip: 'Observe a ponderação: se essa concentração limita as opções das empresas e se há o risco de faltar oferta se uma das 4 maiores deixar o mercado.',
    points: 200,
    options: [
      {
        id: 'q6-opt-a',
        text: 'A dúvida se a concentração limita as opções das empresas e o risco de haver falta de oferta de serviço de auditoria para grandes corporações se uma das quatro maiores deixar o mercado.',
        isCorrect: true,
        explanation: 'Exato! O item 4.10 registra literalmente essa advertência: a extrema dependência das 4 maiores gera o risco sistêmico de escassez de oferta de auditoria para grandes companhias globais caso uma delas encerre atividades.'
      },
      {
        id: 'q6-opt-b',
        text: 'O risco de haver excesso de concorrência gerando queda acentuada nos honorários de mercado.',
        isCorrect: false,
        explanation: 'Incorreto. O problema é a falta de opções (oligopólio concentrado), e não o excesso de concorrência.'
      },
      {
        id: 'q6-opt-c',
        text: 'A garantia regulatória de que pequenas firmas assumiriam instantaneamente 100% dos grandes contratos.',
        isCorrect: false,
        explanation: 'Incorreto. O texto destaca a limitação estrutural de substituição imediata para grandes corporações.'
      },
      {
        id: 'q6-opt-d',
        text: 'A eliminação permanente da necessidade de reguladores como a CVM e o CFC existirem.',
        isCorrect: false,
        explanation: 'Incorreto. A concentração exige atuação ainda mais firme e vigilante dos reguladores.'
      }
    ]
  }
];

export { LEVEL_METADATA } from './levels';
