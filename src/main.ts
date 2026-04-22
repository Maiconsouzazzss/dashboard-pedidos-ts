import { pedidos } from "./data.js";
import type { Pedido, Resumo, StatusPagamento } from "./types.js";

const state = {
  q: "",
  status: "todos",
  categoria: "todas"
};

type FiltroStatus = "todos" | StatusPagamento;
type FiltroCategoria = "todas" | Pedido["categoria"];

const $q = document.getElementById("q") as HTMLInputElement;
const $status = document.getElementById("status") as HTMLSelectElement;
const $categoria = document.getElementById("categoria") as HTMLSelectElement;
const $reset = document.getElementById("reset") as HTMLButtonElement;

const $cTotalPedidos = document.getElementById("cTotalPedidos")!;
const $cTotalPago = document.getElementById("cTotalPago")!;
const $cTotalPendente = document.getElementById("cTotalPendente")!;
const $cMediaPago = document.getElementById("cMediaPago")!;
const $porCategoria = document.getElementById("porCategoria")!;
const $lista = document.getElementById("lista")!;

function debounce(fn: Function, delay = 300) {
  let timer: any;

  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const renderDebounced = debounce(() => {
  render();
}, 300);

function dinheiro(v: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function filtrar(base: Pedido[]): Pedido[] {
  const q = state.q.trim().toLowerCase();
  const status = state.status;
  const categoria = state.categoria;

  return base
    .filter(p => (q ? p.cliente.toLowerCase().includes(q) : true))
    .filter(p => (status === "todos" ? true : p.status === status))
    .filter(p => (categoria === "todas" ? true : p.categoria === categoria));
}

function resumir(lista: Pedido[]): Resumo {
  const parcial = lista.reduce(
    (acc, p) => {
      acc.totalPedidos += 1;

      if (p.status === "pago") {
        acc.totalPago += p.valor;
        acc.qtdPagos += 1;
      } else {
        acc.totalPendente += p.valor;
      }

      // por categoria: { qtd, total }
      if (!acc.porCategoria[p.categoria]) {
        acc.porCategoria[p.categoria] = { qtd: 0, total: 0 };
      }
      acc.porCategoria[p.categoria].qtd += 1;
      acc.porCategoria[p.categoria].total += p.valor;

      return acc;
    },
    {
      totalPedidos: 0,
      totalPago: 0,
      totalPendente: 0,
      qtdPagos: 0,
      porCategoria: {} as Resumo["porCategoria"]
    }
  );

  const mediaPago = parcial.qtdPagos === 0 ? 0 : parcial.totalPago / parcial.qtdPagos;

  return { ...parcial, mediaPago };
}

function renderPorCategoria(porCategoria: Resumo["porCategoria"]) {
  const totalGeral = Object.values(porCategoria)
    .reduce((acc, cur) => acc + cur.total, 0);

  const linhas = Object.entries(porCategoria)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([cat, info]) => {
      const percent = totalGeral ? (info.total / totalGeral) * 100 : 0;

      return `
        <div class="mini-row">
          <div>
            <div class="mini-title">${cat}</div>
            <div class="mini-sub">${info.qtd} pedido(s)</div>

            <div style="
              height: 6px;
              background: rgba(255,255,255,0.08);
              border-radius: 10px;
              margin-top: 6px;
              overflow: hidden;
            ">
              <div style="
                width: ${percent}%;
                height: 100%;
                background: linear-gradient(90deg, #2563eb, #fb0b0b);
              "></div>
            </div>
          </div>

          <div class="mini-right">${dinheiro(info.total)}</div>
        </div>
      `;
    })
    .join("");

  $porCategoria.innerHTML =
    linhas || `<div class="empty">Nada para mostrar com esses filtros.</div>`;
}

function renderLista(lista: Pedido[]) {
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
}

// eventos
$q.addEventListener("input", () => {
  state.q = $q.value;
  renderDebounced();
});

$status.addEventListener("change", () => {
  state.status = $status.value;
  render();
});

$categoria.addEventListener("change", () => {
  state.categoria = $categoria.value;
  render();
});

$reset.addEventListener("click", () => {
  $q.value = "";
  $status.value = "todos";
  $categoria.value = "todas";
  render();
});

// primeira renderização
render();