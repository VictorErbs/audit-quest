# Audit Quest — Operação Transparência

Audit Quest é um jogo educativo de investigação em pixel art para estudantes de Ciências Contábeis. Você assume o papel de fiscal contábil em uma simulação e explora três pisos para reunir evidências sobre transparência e qualidade na auditoria independente.

A campanha usa o item 4.10 do livro *Auditoria Contábil*, de Silvio Aparecido Crepaldi (páginas 149–150), e três questões de prova selecionadas do material das páginas 152–157. As questões de prova seguem o contexto normativo de sua época.

## Como jogar

Converse com os personagens, explore os pontos marcados com curiosidades e responda às perguntas nos terminais. Cada piso tem três questões obrigatórias. Acerte todas para liberar a saída. Se errar, você pode tentar novamente e recebe metade dos pontos ao acertar. No último piso, atravesse a porta do Conselho para emitir o parecer final e registrar sua justificativa.

| Piso | Dificuldade | Temas |
| --- | --- | --- |
| 1 | Fácil | Foco dos reguladores, concentração nas Big Four e elementos do controle de qualidade |
| 2 | Média | Áreas de divulgação e quem pode revisar a qualidade de uma auditoria |
| 3 | Difícil | Resistência à divulgação, risco de falta de oferta, independência e monitoramento |

| Controle | Ação |
| --- | --- |
| Setas ou W, A, S, D | Mover |
| Espaço | Interagir com personagens, terminais, portas e elevadores |
| B | Abrir o Dossiê de Evidências |
| F | Alternar tela cheia |

## Executar localmente

Use Node.js 22 ou superior. Crie um arquivo `.env.local` com uma chave
aleatória de pelo menos 32 caracteres em `AUDIT_SESSION_SECRET` e um código
de professor aleatório de pelo menos 16 caracteres em `AUDIT_TEACHER_CODE`.
Gere valores independentes, por exemplo executando duas vezes
`node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.

```bash
npm ci
npm run dev
```

Abra [localhost:3000](http://localhost:3000). Cada aluno cria sua conta com
nome, matrícula, e-mail e senha. O acesso usa matrícula e senha. A partida
é salva no servidor e pode ser retomada em outro navegador. Depois de
enviar o parecer, o aluno pode consultar o ranking, mas não pode responder
novamente. As 50 melhores notas aparecem para usuários autenticados. Em
caso de empate, tem prioridade quem concluiu primeiro.

Na aba **Professor**, basta informar o nome para jogar em modo de prática
ou abrir o ranking geral. A prática não gera nota no ranking. O **Painel
administrativo** exige o código de professor para editar a campanha e
consultar os pareceres. Alterações nas perguntas só afetam partidas que
ainda não registraram a primeira resposta. A correção, os pontos e o
bloqueio de nova partida são aplicados no servidor. Para verificar as
questões e os mapas, execute `npx tsx verify-check.ts`. Para gerar a versão
de produção, execute `npm run build`.

## Vercel e armazenamento

Em desenvolvimento sem Blob, o servidor grava em `.audit-quest-data/v4/`.
Na Vercel, conecte um **Vercel Blob privado** e disponibilize
`BLOB_READ_WRITE_TOKEN` ao projeto. As chaves separam Preview e Production
por prefixo. Configure `AUDIT_SESSION_SECRET` e `AUDIT_TEACHER_CODE` em cada
ambiente, com valores diferentes. Não coloque segredos no Git. Contas,
partidas e relatórios ficam no Blob privado. A senha é armazenada como hash
scrypt com salt. O ranking divulga nome e pontuação, sem e-mail ou matrícula.

Para restringir o cadastro a uma turma, configure `AUDIT_ROSTER_JSON` com
um objeto que associa a matrícula normalizada ao e-mail em minúsculas,
por exemplo `{"2026001":"aluna@example.com"}`. Sem essa configuração, uma
pessoa pode se cadastrar usando outra matrícula. O formulário valida o
formato do e-mail, sem enviar confirmação de titularidade. Aplique limites
de requisição ao endpoint `POST /api/session` no Firewall da Vercel antes
de abrir o cadastro ao público.

Os registros antigos do Redis não são importados. As questões padrão e
seus gabaritos fazem parte do código fonte. Para avaliação formal, use
perguntas cujo gabarito não esteja disponível aos alunos.

## Código

O projeto usa Next.js, React, TypeScript e Tailwind CSS. O mapa e a movimentação são renderizados em Canvas.

- `src/data/` reúne o banco de questões e a descrição dos níveis.
- `src/game/` contém mapas, diálogos, movimentação e renderização.
- `src/components/` reúne o quiz, o dossiê, o parecer e o painel.
- `src/app/api/` fornece as rotas de questões e pareceres.
