import { pedidos } from "./data.js";
const $q = document.getElementById("q");
const $status = document.getElementById("status");
const $categoria = document.getElementById("categoria");
const $reset = document.getElementById("reset");
const $cTotalPedidos = document.getElementById("cTotalPedidos");
const $cTotalPago = document.getElementById("cTotalPago");
const $cTotalPendente = document.getElementById("cTotalPendente");
const $cMediaPago = document.getElementById("cMediaPago");
const $porCategoria = document.getElementById("porCategoria");
const $lista = document.getElementById("lista");
function dinheiro(v) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}
let chartInstance = null;

function renderGrafico(resumo) {
  const ctx = document.getElementById('meuGrafico').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'doughnut', // Gráfico de rosca
    data: {
      labels: ['Pago', 'Pendente'],
      datasets: [{
        data: [resumo.totalPago, resumo.totalPendente],
        backgroundColor: ['#22c55e', '#f59e0b'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#ffffff' } }
      }
    }
  });
}
function filtrar(base) {
    const q = $q.value.trim().toLowerCase();
    const status = $status.value;
    const categoria = $categoria.value;
    return base
        .filter(p => (q ? p.cliente.toLowerCase().includes(q) : true))
        .filter(p => (status === "todos" ? true : p.status === status))
        .filter(p => (categoria === "todas" ? true : p.categoria === categoria));
}
function resumir(lista) {
    const parcial = lista.reduce((acc, p) => {
        acc.totalPedidos += 1;
        if (p.status === "pago") {
            acc.totalPago += p.valor;
            acc.qtdPagos += 1;
        }
        else {
            acc.totalPendente += p.valor;
        }
        // por categoria: { qtd, total }
        if (!acc.porCategoria[p.categoria]) {
            acc.porCategoria[p.categoria] = { qtd: 0, total: 0 };
        }
        acc.porCategoria[p.categoria].qtd += 1;
        acc.porCategoria[p.categoria].total += p.valor;
        return acc;
    }, {
        totalPedidos: 0,
        totalPago: 0,
        totalPendente: 0,
        qtdPagos: 0,
        porCategoria: {}
    });
    const mediaPago = parcial.qtdPagos === 0 ? 0 : parcial.totalPago / parcial.qtdPagos;
    return { ...parcial, mediaPago };
}
function renderPorCategoria(porCategoria) {
    const linhas = Object.entries(porCategoria)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([cat, info]) => {
        return `
        <div class="mini-row">
          <div class="mini-left">
            <div class="mini-title">${cat}</div>
            <div class="mini-sub">${info.qtd} pedido(s)</div>
          </div>
          <div class="mini-right">${dinheiro(info.total)}</div>
        </div>
      `;
    })
        .join("");
    $porCategoria.innerHTML = linhas || `<div class="empty">Nada para mostrar com esses filtros.</div>`;
}
function renderLista(lista) {
    const html = lista
        .slice()
        .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
        .map(p => {
        const badgeClass = p.status === "pago" ? "ok" : "warn";
        const cat = p.categoria === "servico" ? "Serviço" : p.categoria[0].toUpperCase() + p.categoria.slice(1);
        return `
        <div class="item">
          <div class="item-main">
            <div class="item-title">${p.cliente}</div>
            <div class="item-sub">${cat} • ${p.criadoEm}</div>
          </div>
          <div class="item-side">
            <div class="item-value">${dinheiro(p.valor)}</div>
            <div class="badge ${badgeClass}">${p.status}</div>
          </div>
        </div>
      `;
    })
        .join("");
    $lista.innerHTML = html || `<div class="empty">Nenhum pedido encontrado.</div>`;
}
function render() {
    const listaFiltrada = filtrar(pedidos);
    const resumo = resumir(listaFiltrada);
    $cTotalPedidos.textContent = String(resumo.totalPedidos);
    $cTotalPago.textContent = dinheiro(resumo.totalPago);
    $cTotalPendente.textContent = dinheiro(resumo.totalPendente);
    $cMediaPago.textContent = dinheiro(resumo.mediaPago);
    renderPorCategoria(resumo.porCategoria);
    renderLista(listaFiltrada);
    renderGrafico(resumo);
}
// eventos
$q.addEventListener("input", render);
$status.addEventListener("change", render);
$categoria.addEventListener("change", render);
$reset.addEventListener("click", () => {
    $q.value = "";
    $status.value = "todos";
    $categoria.value = "todas";
    render();
});
// primeira renderização
render();
