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

Com Node.js e npm instalados, abra um terminal na pasta do projeto:

~~~bash
npm ci
npm run dev
~~~

Abra [localhost:3000](http://localhost:3000) no navegador. Use a mesma matrícula no mesmo navegador para retomar o progresso. Para verificar as questões e os mapas, execute `npx tsx verify-check.ts`. Para gerar a versão de produção, use `npm run build`.

## Painel e armazenamento

O painel permite editar as questões da campanha e consultar os pareceres enviados. O progresso individual fica no navegador. Em desenvolvimento, o servidor guarda as edições e os pareceres em `.audit-quest-data/`.

Na Vercel, configure `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` com as credenciais do mesmo banco Upstash Redis para compartilhar questões e pareceres. Os perfis do jogo servem à simulação e não autenticam usuários. Use dados fictícios em uma instância pública.

O botão **DEV** permite navegar entre pisos e testar portas e o parecer sem alterar o progresso da partida normal.

## Código

O projeto usa Next.js, React, TypeScript e Tailwind CSS. O mapa e a movimentação são renderizados em Canvas.

- `src/data/` reúne o banco de questões e a descrição dos níveis.
- `src/game/` contém mapas, diálogos, movimentação e renderização.
- `src/components/` reúne o quiz, o dossiê, o parecer e o painel.
- `src/app/api/` fornece as rotas de questões e pareceres.
