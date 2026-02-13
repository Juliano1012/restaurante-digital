<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>README — Restaurante (SPA de Pedidos)</title>
<style>
  :root{
    --bg:#f8f5ef; --card:#fffdf8; --ink:#2b2620; --muted:#6e655a;
    --primary:#b86b45; --border:#e8decd; --ok:#2e7d32; --danger:#c62828;
  }
  *{box-sizing:border-box}
  body{
    margin:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    color:var(--ink); background: radial-gradient(1800px 800px at 50% -10%, #f3efe6, var(--bg));
    line-height:1.55; letter-spacing:.2px; padding:24px;
  }
  .wrap{max-width:920px; margin:0 auto; background:var(--card); border:1px solid var(--border);
        border-radius:14px; box-shadow:0 1px 2px rgba(0,0,0,.04),0 2px 10px rgba(0,0,0,.04); padding:24px;}
  h1,h2,h3{line-height:1.25}
  h1{margin-top:0}
  .badge{display:inline-block; font-size:12px; font-weight:700; color:#fff; background:var(--primary);
         padding:4px 10px; border-radius:999px; letter-spacing:.3px}
  .muted{color:var(--muted)}
  .grid{display:grid; gap:14px}
  .two{grid-template-columns: 1fr 1fr}
  @media (max-width:760px){.two{grid-template-columns:1fr}}
  pre{background:#111; color:#f1f1f1; padding:12px; border-radius:10px; overflow:auto}
  code{font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace}
  .card{border:1px solid var(--border); border-radius:12px; padding:14px; background:#fff}
  .ok{color:var(--ok)} .danger{color:var(--danger)}
  .callout{border-left:4px solid var(--primary); background:#fff7f1; padding:10px 12px; border-radius:8px}
  .kbd{display:inline-block; border:1px solid var(--border); padding:2px 8px; border-radius:8px; background:#fff}
  a{color:var(--primary); text-decoration:none} a:hover{text-decoration:underline}
  ul{margin:0 0 0 18px}
  .small{font-size:13px}
  .center{text-align:center}
</style>
</head>
<body>
<div class="wrap">

  <h1>Restaurante — SPA de Pedidos (Menu • Carrinho • Pix • Cozinha)</h1>
  <p class="muted">Uma interface simples e direta para restaurantes: clientes escolhem itens, adicionam observações, pagam via “Pix visual”, e a cozinha acompanha os pedidos com ETA.</p>
  <p><span class="badge">HTML + CSS + JS puros</span></p>

  <hr/>

  <h2>💡 Visão Geral</h2>
  <p>
    Este projeto é uma aplicação de página única (SPA) para fluxo de pedidos em restaurante. 
    Ele inclui <strong>menu por categorias</strong>, <strong>detalhes de itens</strong> (com quantidade e observações), 
    <strong>carrinho</strong>, <strong>seleção de mesa</strong>, uma tela de <strong>Pix</strong> com um <em>QR decorativo</em>
    (não funcional) e painéis de <strong>Pedidos</strong> e <strong>Cozinha</strong> com ETA, progress bar e contagem.
  </p>

  <div class="grid two">
    <div class="card">
      <h3>Principais Telas</h3>
      <ul>
        <li><strong>Home</strong> – Acesso rápido às categorias (Comidas, Bebidas, Doces).</li>
        <li><strong>Menu</strong> – Cards com imagem, preço, ver detalhes e adicionar.</li>
        <li><strong>Detalhe</strong> – Ingredientes, observações, quantidade e “Adicionar”.</li>
        <li><strong>Carrinho</strong> – Lista itens, edita quantidades/notas, total.</li>
        <li><strong>Pix</strong> – Mostra um QR <em>apenas visual</em> e o logo.</li>
        <li><strong>Pedidos</strong> – Cards com estimativa, hora prevista e barra de progresso.</li>
        <li><strong>Cozinha</strong> – Fila, itens por pedido, observações e ETA.</li>
      </ul>
    </div>
    <div class="card">
      <h3>Recursos de Destaque</h3>
      <ul>
        <li><strong>Tema claro/escuro</strong> com toggle e persistência.</li>
        <li><strong>Mesa</strong> com validação (1–50) e salvamento em <code>localStorage</code>.</li>
        <li><strong>Observações</strong> no item e no carrinho, com sanitização contra HTML.</li>
        <li><strong>ETA</strong> (simulado) + contagem regressiva + barra de progresso.</li>
        <li><strong>Design responsivo</strong> e focado em toques ≥ 44px (mobile-friendly).</li>
      </ul>
    </div>
  </div>

  <hr/>

  <h2>🚀 Como Executar</h2>
  <ol>
    <li>Baixe ou clone o projeto.</li>
    <li>Abra o arquivo <span class="kbd">index.html</span> diretamente no navegador.<br/>
      <span class="small muted">Dica: em desenvolvimento, você pode servir com um mini servidor local para evitar restrições de origem.</span>
    </li>
  </ol>
  <p class="callout small">
    <strong>Importante:</strong> a tela <em>Pix</em> utiliza um QR <u>decorativo</u> (não é um BR Code real).
    Ele é re-renderizado conforme tema/estado para demonstrar visual. Em produção, substitua por um gerador de BR Code Pix.
  </p>

  <h3>Estrutura de Pastas</h3>
  <pre><code>.
├─ index.html      # Estrutura da SPA e todas as seções
├─ style.css       # Design system, temas, responsividade
└─ script.js       # Navegação, carrinho, pedidos, ETA, QR decorativo
</code></pre>

  <hr/>

  <h2>🧩 Tecnologias</h2>
  <ul>
    <li><strong>HTML5</strong> — Sem frameworks.</li>
    <li><strong>CSS3</strong> — Design System com tokens, dark mode, responsivo.</li>
    <li><strong>JavaScript</strong> — SPA simples, sem build; uso de <code>localStorage</code> para tema/mesa.</li>
  </ul>

  <hr/>

  <h2>🎨 Design & Acessibilidade</h2>
  <ul>
    <li>Tokens de cor, tipografia e espaçamento centralizados em <code>:root</code>.</li>
    <li>Dark mode com detecção de <code>prefers-color-scheme</code> e toggle persistente.</li>
    <li>Alvos de toque &ge; 44px; foco visível (<em>focus ring</em>) e contraste pensado.</li>
    <li>Layout responsivo: grid de cards, colunas adaptativas e elementos “pegáveis”.</li>
  </ul>

  <hr/>

  <h2>🛒 Fluxo de Pedido</h2>
  <ol>
    <li>Escolha itens no <strong>Menu</strong> (ou entre em <strong>Detalhe</strong> para notas/quantidade).</li>
    <li>Abra o <strong>Carrinho</strong>, ajuste notas e quantidades.</li>
    <li>Informe o <strong>número da mesa</strong> (1–50).</li>
    <li>Clique em <strong>Pagar</strong> &rarr; vai para <strong>Pix</strong> e registra o pedido.</li>
    <li>Veja o pedido nas telas de <strong>Pedidos</strong> e <strong>Cozinha</strong> com <em>ETA</em> e progresso.</li>
  </ol>

  <h3>ETA e Progresso</h3>
  <ul>
    <li>Tempo estimado aleatório: <code>5</code>–<code>20</code> minutos por pedido (simulação).</li>
    <li>Contagem regressiva (“Faltam mm:ss”), alternando para <span class="ok">Pronto</span> ou <span class="danger">Atrasado +mm:ss</span>.</li>
    <li>Barra de progresso sincronizada com o tempo.</li>
  </ul>

  <hr/>

  <h2>🔐 Segurança & Notas</h2>
  <ul>
    <li><strong>Sanitização</strong> de texto de observações para evitar injeção HTML (função <code>sanitize</code>).</li>
    <li><strong>QR de Pix</strong>: <u>não</u> é utilizável para pagamento — é apenas uma ilustração (com “cara” de QR real) para demonstração visual.</li>
    <li><strong>Dados</strong> são mantidos em memória (<code>orders</code>, <code>cart</code>) e <code>localStorage</code> (tema/mesa) — sem backend.</li>
  </ul>

  <hr/>

  <h2>🧪 Como Testar Rápido</h2>
  <ul>
    <li>Adicione itens em <strong>Comidas</strong>/<strong>Bebidas</strong>/<strong>Doces</strong>.</li>
    <li>Edite a <strong>Mesa</strong> no <strong>Carrinho</strong> (valor inválido fica com borda vermelha).</li>
    <li>Clique em <strong>Pagar</strong>, então confira o <strong>ETA</strong> nas telas <strong>Pedidos</strong> e <strong>Cozinha</strong>.</li>
    <li>Troque o <strong>Tema</strong> (botão ☀️/🌙 no cabeçalho) e veja o QR redezenhar no esquema de cores.</li>
  </ul>

  <hr/>

  <h2>🗺️ Roadmap (Sugestões)</h2>
  <ul>
    <li>✅ (Atual) SPA estável com carrinho, mesa, pedidos, cozinha e ETA.</li>
    <li>⬜ Integração com <strong>BR Code Pix real</strong> (estático ou dinâmico).</li>
    <li>⬜ Persistência de <strong>pedidos</strong> e <strong>cozinha</strong> via backend (REST/WebSocket).</li>
    <li>⬜ Perfis: <em>Cliente</em> vs <em>Cozinha</em> (perfis/URL separados, ou auth simples).</li>
    <li>⬜ Painel de administração: cadastro de itens, preços e fotos.</li>
    <li>⬜ Impressão de comanda (via impressora térmica/ESC-POS).</li>
    <li>⬜ A11y extra: rotas, landmarks ARIA e atalhos de teclado.</li>
  </ul>

  <hr/>

  <h2>🤝 Contribuindo</h2>
  <ol>
    <li>Faça um fork.</li>
    <li>Crie uma branch: <code>feat/sua-ideia</code> ou <code>fix/um-detalhe</code>.</li>
    <li>Abra um PR explicando a motivação e screenshots das mudanças.</li>
  </ol>

  <hr/>

  <h2>📸 Screenshots (sugestão de seções)</h2>
  <ul>
    <li>Home e Menu (tema claro e escuro)</li>
    <li>Detalhe do item com observações</li>
    <li>Carrinho e seleção de mesa</li>
    <li>Pix (&ldquo;QR decorativo&rdquo;)</li>
    <li>Pedidos e Cozinha (ETA + progresso)</li>
  </ul>

  <hr/>

  <h2>📄 Licença</h2>
  <p>Defina a licença que preferir (ex.: MIT). Caso não tenha uma, você pode incluir um arquivo <code>LICENSE</code> com o texto da licença.</p>

  <hr/>
  <p class="center small muted">Feito com ☕ e cuidado para demonstrar um fluxo redondo de pedidos em restaurante.<br/>Se precisar, personalizo o texto e a identidade visual para o seu caso real.</p>
</div>
</body>
</html>
