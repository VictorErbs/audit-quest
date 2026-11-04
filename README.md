# AUDIT QUEST — Operação Transparência (Item 4.10)

> Jogo investigativo em Pixel Art RPG desenvolvido para estudantes de Ciências Contábeis, estritamente baseado no **Item 4.10 — "Transparência de auditorias está no foco de reguladores"** do livro *Auditoria Contábil* (Prof. Dr. Silvio Aparecido Crepaldi, pág. 149–150).

---

## 🎮 Visão Geral

O jogador assume o papel de um Fiscal Contábil credenciado pela CVM/CFC investigando firmas de auditoria independente (Big Four: PwC, Deloitte, EY e KPMG) em busca de evidências sobre governança, relatórios de qualidade, balanços e riscos sistêmicos de concentração de mercado.

---

## 🏢 Estrutura dos Níveis (Item 4.10 Crepaldi)

1. **Piso 1 (Fácil): Foco dos Reguladores & Concentração Big Four**
   - Hall dos Reguladores e escritórios abertos.
   - Medidas exigidas por órgãos internacionais para aumentar a transparência.
   - Domínio de mais de 75% a 90% do mercado corporativo pelas 4 maiores firmas.
   - Catracas centrais lacradas liberadas via resolução de evidências.

2. **Piso 2 (Médio): As Quatro Áreas de Divulgação**
   - Ala oeste de governança e arquivo confidencial de processos a leste.
   - Governança interna, relatórios de qualidade, dados financeiros e lista de clientes.
   - Áreas aceitas pelas firmas sem forte oposição vs áreas de atrito.
   - Divisão vertical blindada destravada pelo terminal analítico.

3. **Piso 3 (Difícil): Resistência & Risco Sistêmico de Oferta**
   - Andar executivo e Salão do Conselho Regulador.
   - Forte resistência das auditorias em abrir balanços próprios auditados, processos disciplinares e litígios.
   - Risco sistêmico de escassez de oferta de auditoria para multinacionais.
   - **Última Porta do Conselho**: Acesso exclusivo para emitir o Parecer Regulatório Final e Certificado de Fiscal.

---

## 🕹️ Controles

- **Mover**: Setas do teclado ou `W / A / S / D`
- **Interagir**: Tecla `[ ESPAÇO ]` (diálogos, computadores, portas, elevadores)
- **Dossiê de Evidências**: Tecla `B`
- **Tela Cheia**: Tecla `F`
- **Modo Desenvolvedor**: Botão `🛠️ DEV` no topo (desbloqueia portas e navegação livre entre pisos para testes)

---

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Rodar testes de integridade das questões e mapas
npx tsx verify-check.ts

# Iniciar servidor de desenvolvimento
npm run dev

# Gerar build de produção
npm run build
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.
