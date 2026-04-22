export type StatusPagamento = "pago" | "pendente";

export interface Pedido {
    id: string;
    cliente: string;
    categoria: "assinatura" | "produto" | "servico";
    valor: number;
    status: StatusPagamento;
    criadoEm: string; //iso simples
}

export interface Resumo {
    totalPedidos: number;
    totalPago: number;
    totalPendente: number;
    qtdPagos: number;
    mediaPago: number;
    porCategoria: Record<string, { qtd: number; total: number}>;
}

