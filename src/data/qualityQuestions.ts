import { Question } from '../types/game';

// Questões históricas: preservar a redação e o contexto da prova original.
export const QUALITY_QUESTIONS: Question[] = [
  {
    "id": "q-quality-11",
    "category": "CONCENTRACAO",
    "levelNumber": 1,
    "difficulty": "FACIL",
    "title": "Elementos do controle de qualidade",
    "documentType": "MEMORANDO",
    "scenario": "Questão 11 — FGV/RECIFE/ACI/2014. Exercício das páginas 152 a 157, conforme o contexto normativo da prova original.",
    "prompt": "O sistema de controle de qualidade inclui políticas e procedimentos que tratam dos seguintes elementos:\n\nI. Responsabilidades da liderança pela qualidade na firma.\n\nII. Exigências éticas relevantes.\n\nIII. Aceitação e continuidade de relacionamentos com clientes e trabalhos específicos.\n\nIV. Recursos humanos.\n\nV. Execução do trabalho.\n\nAssinale:",
    "normReference": "FGV/RECIFE/ACI/2014 — questão 11, páginas 152–157 do material enviado; normas na redação da época da questão.",
    "didacticTip": "A qualidade envolve liderança, ética, clientes, pessoas e execução.",
    "points": 200,
    "options": [
      {
        "id": "q-quality-11-a",
        "text": "Se somente os elementos III e V estiverem corretos.",
        "isCorrect": false,
        "explanation": "Não é essa alternativa. Todos os cinco elementos listados integram o sistema de controle de qualidade."
      },
      {
        "id": "q-quality-11-b",
        "text": "Se somente os elementos I e II estiverem corretos.",
        "isCorrect": false,
        "explanation": "Não é essa alternativa. Todos os cinco elementos listados integram o sistema de controle de qualidade."
      },
      {
        "id": "q-quality-11-c",
        "text": "Se somente os elementos II, III e IV estiverem corretos.",
        "isCorrect": false,
        "explanation": "Não é essa alternativa. Todos os cinco elementos listados integram o sistema de controle de qualidade."
      },
      {
        "id": "q-quality-11-d",
        "text": "Se somente os elementos III, IV e V estiverem corretos.",
        "isCorrect": false,
        "explanation": "Não é essa alternativa. Todos os cinco elementos listados integram o sistema de controle de qualidade."
      },
      {
        "id": "q-quality-11-e",
        "text": "Se todos os elementos estiverem corretos.",
        "isCorrect": true,
        "explanation": "Correto! Todos os cinco elementos listados integram o sistema de controle de qualidade."
      }
    ]
  },
  {
    "id": "q-quality-14",
    "category": "DIVULGACAO",
    "levelNumber": 2,
    "difficulty": "MEDIO",
    "title": "Quem pode revisar a qualidade?",
    "documentType": "MEMORANDO",
    "scenario": "Questão 14 — CESPE/AFTE/SEFAZ-RS/2019. Exercício das páginas 152 a 157, conforme o contexto normativo da prova original.",
    "prompt": "A revisão da qualidade dos trabalhos de auditoria é um processo que visa fornecer, na data do relatório, ou antes, uma avaliação objetiva dos julgamentos relevantes feitos pela equipe de trabalho e das conclusões atingidas ao se elaborar o relatório.\n\nEsse trabalho deve ser realizado por:",
    "normReference": "CESPE/AFTE/SEFAZ-RS/2019 — questão 14, páginas 152–157 do material enviado; normas na redação da época da questão.",
    "didacticTip": "Experiência não basta: o revisor precisa estar fora da equipe que executou a auditoria.",
    "points": 200,
    "options": [
      {
        "id": "q-quality-14-a",
        "text": "Membro da equipe de auditoria especialmente designado para esse fim.",
        "isCorrect": false,
        "explanation": "Não é essa alternativa. O revisor pode ser da firma ou externo, desde que qualificado e não envolvido na auditoria."
      },
      {
        "id": "q-quality-14-b",
        "text": "Pessoa especialmente designada pela empresa auditada e com a devida qualificação técnica.",
        "isCorrect": false,
        "explanation": "Não é essa alternativa. O revisor pode ser da firma ou externo, desde que qualificado e não envolvido na auditoria."
      },
      {
        "id": "q-quality-14-c",
        "text": "Sócio da empresa de auditoria ou pelo auditor chefe da equipe que realizou a auditoria.",
        "isCorrect": false,
        "explanation": "Não é essa alternativa. O revisor pode ser da firma ou externo, desde que qualificado e não envolvido na auditoria."
      },
      {
        "id": "q-quality-14-d",
        "text": "Sócio ou outro profissional da firma de auditoria, ou pessoa externa qualificada, ou equipe formada por essas pessoas, nenhuma delas envolvida na auditoria.",
        "isCorrect": true,
        "explanation": "Correto! O revisor pode ser da firma ou externo, desde que qualificado e não envolvido na auditoria."
      },
      {
        "id": "q-quality-14-e",
        "text": "Profissional de contabilidade devidamente qualificado e certificado e que não tenha participado ou interagido de qualquer forma com os trabalhos de auditoria, ainda que integrante da empresa auditada.",
        "isCorrect": false,
        "explanation": "Não é essa alternativa. O revisor pode ser da firma ou externo, desde que qualificado e não envolvido na auditoria."
      }
    ]
  },
  {
    "id": "q-quality-15",
    "category": "RESISTENCIA_RISCO",
    "levelNumber": 3,
    "difficulty": "DIFICIL",
    "title": "Independência, revisão e monitoramento",
    "documentType": "MEMORANDO",
    "scenario": "Questão 15 — Marcelo Aragão. Exercício das páginas 152 a 157, conforme o contexto normativo da prova original.",
    "prompt": "A respeito do controle de qualidade da firma de auditoria independente das demonstrações contábeis, analise as afirmativas a seguir.\n\nI. Pelo menos uma vez por ano, a firma deve obter confirmação por escrito do cumprimento de suas políticas e procedimentos sobre independência de todo o pessoal da firma, que precisa ser independente por exigências éticas relevantes.\n\nII. Revisão do controle de qualidade do trabalho é o processo projetado para fornecer uma avaliação objetiva, antes ou depois da data do relatório do auditor, dos julgamentos relevantes feitos pela equipe do trabalho e das conclusões obtidas ao elaborar o relatório.\n\nIII. Monitoramento é o processo que consiste na contínua consideração e avaliação do sistema de controle de qualidade da firma, incluindo a inspeção periódica de uma seleção de trabalhos concluídos, projetados para fornecer à firma segurança razoável de que seu sistema de controle de qualidade está operando de maneira efetiva.\n\nEstão corretas somente as afirmativas:",
    "normReference": "Marcelo Aragão — questão 15, páginas 152–157 do material enviado; normas na redação da época da questão.",
    "didacticTip": "Diferencie a revisão do trabalho do monitoramento contínuo do sistema da firma.",
    "points": 200,
    "options": [
      {
        "id": "q-quality-15-a",
        "text": "I.",
        "isCorrect": false,
        "explanation": "Não é essa alternativa. I e III estão corretas. A II está errada: a revisão deve ser concluída na data do relatório ou antes, nunca depois."
      },
      {
        "id": "q-quality-15-b",
        "text": "I e III.",
        "isCorrect": true,
        "explanation": "Correto! I e III estão corretas. A II está errada: a revisão deve ser concluída na data do relatório ou antes, nunca depois."
      },
      {
        "id": "q-quality-15-c",
        "text": "II e III.",
        "isCorrect": false,
        "explanation": "Não é essa alternativa. I e III estão corretas. A II está errada: a revisão deve ser concluída na data do relatório ou antes, nunca depois."
      },
      {
        "id": "q-quality-15-d",
        "text": "I e II.",
        "isCorrect": false,
        "explanation": "Não é essa alternativa. I e III estão corretas. A II está errada: a revisão deve ser concluída na data do relatório ou antes, nunca depois."
      },
      {
        "id": "q-quality-15-e",
        "text": "I, II e III.",
        "isCorrect": false,
        "explanation": "Não é essa alternativa. I e III estão corretas. A II está errada: a revisão deve ser concluída na data do relatório ou antes, nunca depois."
      }
    ]
  }
];
