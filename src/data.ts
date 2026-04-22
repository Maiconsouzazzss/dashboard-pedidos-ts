import type { Pedido } from "./types.js";

export const pedidos: Pedido[] = [
  { id: "p1", cliente: "Ana",     categoria: "assinatura", valor: 59.9,  status: "pago",     criadoEm: "2026-02-10" },
  { id: "p2", cliente: "Bruno",   categoria: "produto",    valor: 120.0, status: "pendente", criadoEm: "2026-02-11" },
  { id: "p3", cliente: "Carlos",  categoria: "servico",    valor: 200.0, status: "pago",     criadoEm: "2026-02-12" },
  { id: "p4", cliente: "Daniela", categoria: "produto",    valor: 49.9,  status: "pendente", criadoEm: "2026-02-13" },
  { id: "p5", cliente: "Eva",     categoria: "produto",    valor: 89.9,  status: "pago",     criadoEm: "2026-02-14" },
  { id: "p6", cliente: "Ana",     categoria: "servico",    valor: 150.0, status: "pendente", criadoEm: "2026-02-15" },
  { id: "p7", cliente: "Bruno",   categoria: "assinatura", valor: 59.9,  status: "pago",     criadoEm: "2026-02-16" },
  { id: "p8", cliente: "Carlos",  categoria: "produto",    valor: 30.0,  status: "pago",     criadoEm: "2026-02-17" }
];
