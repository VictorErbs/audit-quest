export type TileType = 
  | 'WALL'
  | 'FLOOR'
  | 'CARPET'
  | 'DESK'
  | 'CABINET'
  | 'DOOR_LOCKED'
  | 'DOOR_OPEN'
  | 'ELEVATOR'
  | 'PLANT'
  | 'WATER_COOLER';

export interface InteractiveNode {
  id: string;
  x: number;
  y: number;
  type: 'QUESTION' | 'NPC' | 'DOOR' | 'ELEVATOR' | 'HINT';
  questionId?: string;
  name: string;
  dialogue?: string[];
  avatar?: string;
  requiresQuestionIds?: string[];
  solved?: boolean;
}

export interface MapData {
  levelNumber: number;
  name: string;
  width: number;
  height: number;
  playerStart: { x: number; y: number };
  tiles: TileType[][];
  interactives: InteractiveNode[];
}

function parseAsciiMap(grid: string[]): TileType[][] {
  return grid.map(row => 
    row.split('').map(char => {
      switch (char) {
        case '#': return 'WALL';
        case '=': return 'CARPET';
        case 'D': return 'DESK';
        case 'F': return 'CABINET';
        case 'L': return 'DOOR_LOCKED';
        case 'O': return 'DOOR_OPEN';
        case 'E': return 'ELEVATOR';
        case 'P': return 'PLANT';
        case 'W': return 'WATER_COOLER';
        default: return 'FLOOR';
      }
    })
  );
}

// =========================================================================
// LEVEL 1 (FÁCIL): CONCENTRAÇÃO & FOCO REGULATÓRIO (Item 4.10, p. 149)
// Layout: Hall de Entrada dos Reguladores & Escritório Central
// 18 columns x 12 rows. Sealed partition at row 7: #######LL#########
// =========================================================================
const MAP_1_ASCII = [
  "##################", // 0
  "#P.....EE.......P#", // 1 (Elevator at 7,1 and 8,1)
  "#.D....==....D...#", // 2 (Hint 1 at 13,2)
  "#......==........#", // 3
  "#......==........#", // 4 (Corredor limpo, removidos quadrados soltos)
  "#..D...==...D....#", // 5 (Hint 2 at 3,5; Question 2 at 12,5)
  "#......==...F....#", // 6
  "#######LL#########", // 7 (Sealed turnstile: 7 '#' + 2 'L' + 9 '#' = 18)
  "#......==........#", // 8
  "#.D....==...D....#", // 9 (NPC at 2,9; Question 1 at 12,9)
  "#P.....==.......P#", // 10 (Player start: 8, 10)
  "##################", // 11
];

const MAP_1_INTERACTIVES: InteractiveNode[] = [
  {
    "id": "node-quality-11",
    "x": 2,
    "y": 2,
    "type": "QUESTION",
    "name": "Terminal 1C: Elementos do controle de qualidade",
    "questionId": "q-quality-11"
},
  {
    id: 'npc-lvl1-guide',
    x: 2,
    y: 9,
    type: 'NPC',
    name: 'Inspetor Ramos (CFC/CVM)',
    dialogue: [
      "Bem-vindo ao Piso 1 da Operação Transparência!",
      "Nossa investigação é baseada no Item 4.10 do livro Auditoria Contábil do Prof. Crepaldi.",
      "Os reguladores internacionais estão exigindo transparência sobre governança, qualidade e dados financeiros.",
      "💡 VOCÊ SABIA? Na questão 11 (FGV/2014), qualidade não se limita à execução: envolve também liderança, ética, aceitação de clientes e recursos humanos.",
      "Investigue o primeiro terminal à direita para liberar a catraca. Acerte os três terminais (1A, 1B e 1C) para subir de nível!"
    ],
    avatar: 'inspector'
  },
  {
    id: 'node-q1',
    x: 12,
    y: 9,
    type: 'QUESTION',
    name: 'Terminal 1A: Foco dos Reguladores',
    questionId: 'q-410-1',
    dialogue: ["Acessando dossiê regulatório: Medidas de transparência exigidas pelos órgãos internacionais..."]
  },
  {
    id: 'door-lvl1-a',
    x: 7,
    y: 7,
    type: 'DOOR',
    name: 'Catraca de Segurança 1A',
    requiresQuestionIds: ['q-410-1'],
    dialogue: ["Catraca travada! Resolva a Questão 1A no Terminal para desbloquear o acesso."]
  },
  {
    id: 'door-lvl1-b',
    x: 8,
    y: 7,
    type: 'DOOR',
    name: 'Catraca de Segurança 1B',
    requiresQuestionIds: ['q-410-1'],
    dialogue: ["Catraca travada! Resolva a Questão 1A no Terminal para desbloquear o acesso."]
  },
  {
    id: 'node-q2',
    x: 12,
    y: 5,
    type: 'QUESTION',
    name: 'Terminal 1B: Concentração Big Four',
    questionId: 'q-410-2',
    dialogue: ["Acessando dados estatísticos: Proporção das 4 maiores firmas nos EUA, Reino Unido e Brasil..."]
  },
  {
    id: 'elevator-lvl1-a',
    x: 7,
    y: 1,
    type: 'ELEVATOR',
    name: 'Elevador de Acesso ao Piso 2',
    requiresQuestionIds: ['q-410-1', 'q-410-2', 'q-quality-11'],
    dialogue: ["Elevador bloqueado! Conclua a investigação do Piso 1 para subir ao Piso 2."]
  },
  {
    id: 'elevator-lvl1-b',
    x: 8,
    y: 1,
    type: 'ELEVATOR',
    name: 'Elevador de Acesso ao Piso 2',
    requiresQuestionIds: ['q-410-1', 'q-410-2', 'q-quality-11'],
    dialogue: ["Elevador bloqueado! Conclua a investigação do Piso 1 para subir ao Piso 2."]
  },
  {
    id: 'hint-lvl1-1',
    x: 13,
    y: 2,
    type: 'HINT',
    name: 'Bancada Histórica: Você Sabia?',
    dialogue: [
      "💡 VOCÊ SABIA?",
      "O termo 'Big Four' surgiu após diversas fusões ao longo do século XX.",
      "Até os anos 80, eram as 'Big Eight'; viraram 'Big Five' nos anos 90 e, em 2002, após a queda da Arthur Andersen no escândalo Enron, consolidou-se o grupo atual das Quatro Maiores (PwC, Deloitte, EY e KPMG)!"
    ]
  },
  {
    id: 'hint-lvl1-2',
    x: 3,
    y: 5,
    type: 'HINT',
    name: 'Mesa de Estudos: Você Sabia?',
    dialogue: [
      "💡 VOCÊ SABIA?",
      "O Ceticismo Profissional é o pilar ético mestre da auditoria contábil (NBC TA 200).",
      "Isso significa que o auditor não deve presumir que a diretoria é desonesta, mas jamais pode aceitar demonstrações financeiras sem evidências comprobatórias suficientes e apropriadas!"
    ]
  }
];

// =========================================================================
// LEVEL 2 (MÉDIO): AS 4 ÁREAS DE DIVULGAÇÃO (Item 4.10, p. 150)
// Layout: Corredor de Gabinetes & Arquivo Confidencial (Divisão Vertical)
// West Wing (Governança) | Paredão em Coluna 8 com Porta | East Wing (Arquivo)
// =========================================================================
const MAP_2_ASCII = [
  "##################", // 0
  "#EE.....#.....EE.#", // 1 (Chegada 1,1; 2,1; Subida ao P3 14,1; 15,1)
  "#==.....#.....==.#", // 2 (Tapete só na saída da porta, alinhado com o elevador)
  "#.D.....#...D....#", // 3 (Hint 1 em 2,3; Hint 2 em 12,3)
  "#.......#........#", // 4
  "#.D.....#...D....#", // 5 (Terminal 2A em 2,5; Terminal 2B em 12,5)
  "#.......#..F...F.#", // 6 (Armários de arquivos)
  "#.......#........#", // 7
  "#=======L========#", // 8 (Porta de segurança lacrada em 8,8)
  "#.D.....#..F..D..#", // 9 (Analista Carla em 2,9)
  "#P......#.......P#", // 10
  "##################", // 11
];

const MAP_2_INTERACTIVES: InteractiveNode[] = [
  {
    "id": "node-quality-14",
    "x": 14,
    "y": 9,
    "type": "QUESTION",
    "name": "Terminal 2C: Quem pode revisar a qualidade?",
    "questionId": "q-quality-14"
},
  {
    id: 'npc-lvl2-analyst',
    x: 2,
    y: 9,
    type: 'NPC',
    name: 'Analista Sênior Carla',
    dialogue: [
      "Piso 2 alcançado, Fiscal! As coisas começam a ficar mais técnicas.",
      "No item 4.10, o Prof. Crepaldi categoriza as informações que os reguladores exigem em 4 áreas.",
      "Algumas áreas as auditorias aceitam divulgar de bom grado; outras geram resistência.",
      "💡 VOCÊ SABIA? Na questão 14 (CESPE/2019), o revisor pode ser um profissional da própria firma ou alguém externo qualificado. Ele não pode ter participado da auditoria que vai revisar.",
      "Investigue o Terminal 2A na ala oeste para liberar o Arquivo Confidencial. Acerte os três terminais (2A, 2B e 2C) para subir!"
    ],
    avatar: 'analyst'
  },
  {
    id: 'node-q3',
    x: 2,
    y: 5,
    type: 'QUESTION',
    name: 'Terminal 2A: As Quatro Áreas de Informação',
    questionId: 'q-410-3',
    dialogue: ["Carregando classificação do Item 4.10: Divisão das 4 áreas de prestação de contas..."]
  },
  {
    id: 'door-lvl2',
    x: 8,
    y: 8,
    type: 'DOOR',
    name: 'Porta de Segurança da Ala de Arquivos',
    requiresQuestionIds: ['q-410-3'],
    dialogue: ["Porta trancada! Responda à Questão 2A sobre as 4 áreas para acessar a ala leste de arquivos."]
  },
  {
    id: 'node-q4',
    x: 12,
    y: 5,
    type: 'QUESTION',
    name: 'Terminal 2B: Áreas Aceitas pelas Auditorias',
    questionId: 'q-410-4',
    dialogue: ["Acessando declarações setoriais: Áreas sem oposição pelas firmas e sua relação com a qualidade..."]
  },
  {
    id: 'elevator-lvl2-a',
    x: 14,
    y: 1,
    type: 'ELEVATOR',
    name: 'Elevador de Acesso ao Piso 3',
    requiresQuestionIds: ['q-410-3', 'q-410-4', 'q-quality-14'],
    dialogue: ["Elevador trancado! Complete a análise das áreas de divulgação para subir ao Piso 3."]
  },
  {
    id: 'elevator-lvl2-b',
    x: 15,
    y: 1,
    type: 'ELEVATOR',
    name: 'Elevador de Acesso ao Piso 3',
    requiresQuestionIds: ['q-410-3', 'q-410-4', 'q-quality-14'],
    dialogue: ["Elevador trancado! Complete a análise das áreas de divulgação para subir ao Piso 3."]
  },
  {
    id: 'hint-lvl2-1',
    x: 2,
    y: 3,
    type: 'HINT',
    name: 'Arquivo CVM: Você Sabia?',
    dialogue: [
      "💡 VOCÊ SABIA?",
      "No Brasil, a CVM determina o rodízio obrigatório da firma de auditoria a cada 5 anos para companhias abertas.",
      "Esse prazo pode ser estendido para até 8 anos apenas se a companhia possuir Comitê de Auditoria Estatutário (CAE) em funcionamento permanente!"
    ]
  },
  {
    id: 'hint-lvl2-2',
    x: 12,
    y: 3,
    type: 'HINT',
    name: 'Prateleira PEPC/CFC: Você Sabia?',
    dialogue: [
      "💡 VOCÊ SABIA?",
      "O Programa de Educação Profissional Continuada (PEPC) do CFC exige que auditores credenciados no CNAI comprovem no mínimo 40 pontos anuais em cursos e treinamentos.",
      "Isso garante conformidade contínua com as normas internacionais IFRS e NBCs!"
    ]
  }
];

// =========================================================================
// LEVEL 3 (DIFÍCIL): RESISTÊNCIA & RISCO SISTÊMICO (Item 4.10, p. 150)
// Layout: Andar Executivo & Salão do Conselho Regulador
// O Parecer Final fica EXCLUSIVAMENTE na Grande Porta de Saída do Conselho!
// =========================================================================
const MAP_3_ASCII = [
  "##################", // 0
  "#P.....LL.......P#", // 1 (A ÚLTIMA PORTA: Parecer Final em 7,1 e 8,1)
  "#......==........#", // 2 (Passadeira imperial até a mesa do conselho)
  "#.D.D..==..D.D...#", // 3 (Mesa executiva do conselho; Hint 2 em 4,3; Q6 em 13,3)
  "#......==........#", // 4
  "#......==........#", // 5 (Tapete alinhado à porta de saída)
  "#######LL#########", // 6 (Catraca blindada do Conselho em 7,6 e 8,6)
  "#..D...==........#", // 7 (Hint 1 em 3,7)
  "#.D....==....D...#", // 8
  "#.D....==....D...#", // 9 (Dr. Crepaldi em 2,9; Q5 Terminal em 13,9)
  "#P.....EE.......P#", // 10 (Elevador de chegada do P2 em 7,10 e 8,10)
  "##################", // 11
];

const MAP_3_INTERACTIVES: InteractiveNode[] = [
  {
    "id": "node-quality-15",
    "x": 11,
    "y": 3,
    "type": "QUESTION",
    "name": "Terminal 3C: Independência, revisão e monitoramento",
    "questionId": "q-quality-15"
},
  {
    id: 'npc-lvl3-crepaldi',
    x: 2,
    y: 9,
    type: 'NPC',
    name: 'Auditor Chefe Dr. Crepaldi',
    dialogue: [
      "Excelente progresso, Fiscal! Chegamos ao Piso 3: o andar do Conselho e da Alta Cúpula.",
      "Aqui enfrentamos a forte resistência das auditorias em abrir suas contas e processos disciplinares.",
      "Além disso, avaliaremos o risco sistêmico de escassez de oferta para grandes corporações se uma das Big Four cair.",
      "💡 VOCÊ SABIA? Na questão 15, monitorar significa avaliar continuamente o sistema, inclusive inspecionando trabalhos concluídos. Já a revisão do trabalho ocorre até a data do relatório, e não depois.",
      "Resolva as três questões nos terminais para desbloquear a Grande Porta e emitir seu Parecer Final!"
    ],
    avatar: 'crepaldi'
  },
  {
    id: 'node-q5',
    x: 13,
    y: 9,
    type: 'QUESTION',
    name: 'Terminal 3A: Pontos de Maior Resistência',
    questionId: 'q-410-5',
    dialogue: ["Acessando atas de negociação: Resistência a balanços auditados próprios, processos disciplinares e litígios..."]
  },
  {
    id: 'door-lvl3-a',
    x: 7,
    y: 6,
    type: 'DOOR',
    name: 'Catraca Blindada do Conselho 3A',
    requiresQuestionIds: ['q-410-5'],
    dialogue: ["Catraca de alta segurança travada! Resolva a Questão 3A para avançar ao Salão do Conselho."]
  },
  {
    id: 'door-lvl3-b',
    x: 8,
    y: 6,
    type: 'DOOR',
    name: 'Catraca Blindada do Conselho 3B',
    requiresQuestionIds: ['q-410-5'],
    dialogue: ["Catraca de alta segurança travada! Resolva a Questão 3A para avançar ao Salão do Conselho."]
  },
  {
    id: 'node-q6',
    x: 13,
    y: 3,
    type: 'QUESTION',
    name: 'Terminal 3B: Risco Sistêmico de Oferta',
    questionId: 'q-410-6',
    dialogue: ["Acessando alerta de risco econômico: Falta de oferta de auditoria para corporações globais..."]
  },
  {
    id: 'hint-lvl3-1',
    x: 3,
    y: 7,
    type: 'HINT',
    name: 'Gabinete de Risco: Você Sabia?',
    dialogue: [
      "💡 VOCÊ SABIA?",
      "Devido a regras de independência e conflitos de interesse, muitas multinacionais não encontrariam opções no mercado se uma das Big Four deixasse de existir.",
      "Por isso o Item 4.10 do Prof. Crepaldi adverte para o risco de falta de oferta de serviços para grandes corporações globais!"
    ]
  },
  {
    id: 'hint-lvl3-2',
    x: 4,
    y: 3,
    type: 'HINT',
    name: 'Arquivo de Balanços: Você Sabia?',
    dialogue: [
      "💡 VOCÊ SABIA?",
      "A republicação de demonstrações contábeis ocorre quando erros materiais graves ou fraudes são identificados após a emissão do parecer oficial.",
      "As firmas de auditoria têm forte resistência em divulgar esse número porque ele indica diretamente falhas em seus controles internos de qualidade!"
    ]
  },
  // =========================================================================
  // A ÚLTIMA PORTA (PARECER FINAL) - Apenas acessível ao concluir a campanha!
  // =========================================================================
  {
    id: 'door-lvl3-final-a',
    x: 7,
    y: 1,
    type: 'DOOR',
    name: 'Porta do Conselho Regulador (Parecer Final)',
    requiresQuestionIds: ['q-410-5', 'q-410-6', 'q-quality-15'],
    dialogue: ["Porta do Conselho trancada! Conclua as investigações de Resistência e Risco Sistêmico para emitir o Parecer Final."]
  },
  {
    id: 'door-lvl3-final-b',
    x: 8,
    y: 1,
    type: 'DOOR',
    name: 'Porta do Conselho Regulador (Parecer Final)',
    requiresQuestionIds: ['q-410-5', 'q-410-6', 'q-quality-15'],
    dialogue: ["Porta do Conselho trancada! Conclua as investigações de Resistência e Risco Sistêmico para emitir o Parecer Final."]
  }
];

export const MAPS: Record<number, MapData> = {
  1: {
    levelNumber: 1,
    name: 'Piso 1: Foco dos Reguladores & Big Four (Item 4.10)',
    width: 18,
    height: 12,
    playerStart: { x: 8, y: 10 },
    tiles: parseAsciiMap(MAP_1_ASCII),
    interactives: MAP_1_INTERACTIVES,
  },
  2: {
    levelNumber: 2,
    name: 'Piso 2: As Quatro Áreas de Divulgação (Item 4.10)',
    width: 18,
    height: 12,
    playerStart: { x: 2, y: 2 },
    tiles: parseAsciiMap(MAP_2_ASCII),
    interactives: MAP_2_INTERACTIVES,
  },
  3: {
    levelNumber: 3,
    name: 'Piso 3: Resistência e Risco de Oferta (Item 4.10)',
    width: 18,
    height: 12,
    playerStart: { x: 8, y: 9 },
    tiles: parseAsciiMap(MAP_3_ASCII),
    interactives: MAP_3_INTERACTIVES,
  },
};
