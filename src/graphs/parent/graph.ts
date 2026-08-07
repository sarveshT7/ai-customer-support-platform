import { END, START, StateGraph } from "@langchain/langgraph";

import { ParentState } from "./state.js";
import { DOMAIN } from "./router.js";

import { routerNode } from "./nodes/router.node.js";
import { orderNode } from "./nodes/order.node.js";
import { ticketNode } from "./nodes/ticket.node.js";
import { productNode } from "./nodes/product.node.js";

export const parentGraph = new StateGraph(ParentState)
    .addNode("router", routerNode)
    .addNode("order", orderNode)
    .addNode("ticket", ticketNode)
    .addNode("product", productNode)

    .addEdge(START, "router")

    .addConditionalEdges(
        "router",
        (state) => state.domain,
        {
            [DOMAIN.ORDER]: "order",
            [DOMAIN.TICKET]: "ticket",
            [DOMAIN.PRODUCT]: "product",
        }
    )

    .addEdge("order", END)
    .addEdge("ticket", END)
    .addEdge("product", END)

    .compile();