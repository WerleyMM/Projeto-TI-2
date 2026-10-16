let todosJogos = [];
let todasEmpresas = [];
let paginaAtual = 1;
const itensPorPagina = 6;

document.addEventListener('DOMContentLoaded', carregarDados);

async function carregarDados() {
  try {
    const response = await fetch('jogos.json');
    const data = await response.json();
    todosJogos = data.jogos;
    todasEmpresas = data.empresas;
    
    if (document.getElementById('gridJogos')) {
      inicializarCatalogo();
    } else if (document.getElementById('gridEmpresas')) {
      inicializarListaEmpresas();
    } else if (document.getElementById('empresaNome')) {
      inicializarPaginaEmpresa();
    }
  } catch (error) {
    console.error('Erro ao carregar o JSON:', error);
  }
}

function inicializarCatalogo() {
  document.getElementById('filtroGenero').addEventListener('change', () => { paginaAtual = 1; renderizarCatalogo(); });
  document.getElementById('filtroPlataforma').addEventListener('change', () => { paginaAtual = 1; renderizarCatalogo(); });
  document.getElementById('ordenacao').addEventListener('change', renderizarCatalogo);
  document.getElementById('inputBusca').addEventListener('input', () => { paginaAtual = 1; renderizarCatalogo(); });
  
  renderizarDestaque();
  renderizarCatalogo();
}

function renderizarDestaque() {
  const container = document.getElementById('destaqueCentral');
  if (!container) return;
  const jogo = todosJogos.find(j => j.destaque) || todosJogos[0];
  container.innerHTML = `
    <div class="card-destaque">
      <img src="${jogo.imagem}" alt="${jogo.nome}">
      <div class="destaque-info">
        <span class="badge-destaque">Jogo em Destaque</span>
        <h2>${jogo.nome}</h2>
        <p><strong>Estúdio:</strong> ${jogo.estudioNome}</p>
        <p><strong>Gênero:</strong> ${jogo.genero} | <strong>Lançamento:</strong> ${jogo.ano}</p>
        <p class="desc-curta">${jogo.descricao}</p>
        <a href="empresa.html?id=${jogo.estudioId}" class="btn-detalhes">Ver Estúdio e Detalhes</a>
      </div>
    </div>
  `;
}

function renderizarCatalogo() {
  const genero = document.getElementById('filtroGenero').value;
  const plataforma = document.getElementById('filtroPlataforma').value;
  const ordem = document.getElementById('ordenacao').value;
  const busca = document.getElementById('inputBusca').value.toLowerCase();
  
  let filtrados = todosJogos.filter(jogo => {
    return (genero === 'Todos' || jogo.genero === genero) &&
           (plataforma === 'Todas' || jogo.plataforma === plataforma) &&
           (jogo.nome.toLowerCase().includes(busca) || jogo.estudioNome.toLowerCase().includes(busca));
  });
  
  filtrados.sort((a, b) => ordem === 'az' ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome));
  
  const total = Math.ceil(filtrados.length / itensPorPagina) || 1;
  const pags = filtrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);
  const grid = document.getElementById('gridJogos');
  
  grid.innerHTML = pags.length === 0 ? '<p style="color:#ff9900">Nenhum jogo encontrado.</p>' : pags.map(jogo => `
    <div class="card-jogo">
      <img src="${jogo.imagem}" alt="${jogo.nome}">
      <h3>${jogo.nome}</h3>
      <p>Estúdio: ${jogo.estudioNome}</p>
      <p>Gênero: ${jogo.genero} | Ano: ${jogo.ano}</p>
      <p class="desc-curta">${jogo.descricao.substring(0, 70)}...</p>
      <a href="empresa.html?id=${jogo.estudioId}" class="btn-detalhes">Ver Estúdio</a>
    </div>
  `).join('');
  
  renderizarPaginacao(total);
}

function renderizarPaginacao(total) {
  const cont = document.getElementById('paginacao');
  cont.innerHTML = `<button class="btn-page" ${paginaAtual === 1 ? 'disabled' : ''} onclick="mudarPagina(${paginaAtual - 1})">< Ant</button>`;
  for (let i = 1; i <= total; i++) {
    cont.innerHTML += `<button class="btn-page ${i === paginaAtual ? 'active' : ''}" onclick="mudarPagina(${i})">${i}</button>`;
  }
  cont.innerHTML += `<button class="btn-page" ${paginaAtual === total ? 'disabled' : ''} onclick="mudarPagina(${paginaAtual + 1})">Prox ></button>`;
}

window.mudarPagina = (pag) => { paginaAtual = pag; renderizarCatalogo(); };

function inicializarPaginaEmpresa() {
  const id = new URLSearchParams(window.location.search).get('id') || 'long-hat-house';
  const emp = todasEmpresas.find(e => e.id === id);
  if (!emp) {
    document.querySelector('.empresa-wrapper').innerHTML = '<h2 style="color:#ff9900">Empresa não encontrada!</h2>';
    return;
  }
  
  document.getElementById('empresaBanner').src = emp.banner;
  document.getElementById('empresaLogo').src = emp.logo;
  document.getElementById('empresaNome').innerText = emp.nome;
  document.getElementById('empresaLocalizacao').innerText = `Localização: ${emp.localizacao}`;
  document.getElementById('empresaSobre').innerHTML = emp.sobre;
  document.getElementById('empresaEmail').innerText = emp.email;
  document.getElementById('empresaEmail').href = `mailto:${emp.email}`;
  
  ['website', 'twitter', 'instagram', 'linkedin'].forEach(link => {
    document.getElementById(`link${link.charAt(0).toUpperCase() + link.slice(1)}`).href = emp.links[link];
  });
  
  const jogosEmpresa = todosJogos.filter(j => j.estudioId === emp.id);
  document.getElementById('gridJogosEmpresa').innerHTML = jogosEmpresa.length === 0 ? '<p style="color:#ff9900">Nenhum jogo cadastrado.</p>' : jogosEmpresa.map(jogo => `
    <div class="card-jogo">
      <img src="${jogo.imagem}" alt="${jogo.nome}">
      <h3>${jogo.nome}</h3>
      <p>Gênero: ${jogo.genero}</p>
      <p class="desc-curta">${jogo.descricao.substring(0, 60)}...</p>
    </div>
  `).join('');
}

function inicializarListaEmpresas() {
  const gridEmpresas = document.getElementById('gridEmpresas');
  const inputBusca = document.getElementById('inputBuscaEmpresa');

  function renderizarEmpresas(filtro = '') {
    const filtradas = todasEmpresas.filter(emp => emp.nome.toLowerCase().includes(filtro.toLowerCase()));
    
    gridEmpresas.innerHTML = filtradas.length === 0 ? '<p style="color:#ff9900">Nenhuma empresa encontrada.</p>' : filtradas.map(emp => `
      <div class="card-jogo">
        <img src="${emp.logo}" alt="${emp.nome}" style="object-fit: contain; background: #fff; height: 140px;">
        <h3>${emp.nome}</h3>
        <p>${emp.localizacao}</p>
        <p class="desc-curta">${emp.sobre.substring(0, 70)}...</p>
        <a href="empresa.html?id=${emp.id}" class="btn-detalhes">Ver Detalhes da Empresa</a>
      </div>
    `).join('');
  }

  if (inputBusca) {
    inputBusca.addEventListener('input', (e) => renderizarEmpresas(e.target.value));
  }
  renderizarEmpresas();
}
