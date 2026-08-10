import { END, MemorySaver, START, StateGraph } from "@langchain/langgraph";

import { ParentState } from "./state.js";
import { DOMAIN } from "./router.js";

import { routerNode } from "./nodes/router.node.js";
import { orderGraph } from "../order/graph.js";
import { ticketGraph } from "../ticket/graph.js";
import { productGraph } from "../product/graph.js";


const memory = new MemorySaver()
export const parentGraph = new StateGraph(ParentState)
    .addNode("router", routerNode)
    .addNode("order", orderGraph)
    .addNode("ticket", ticketGraph)
    .addNode("product", productGraph)

    .addEdge(START, "router")

    .addConditionalEdges(
        "router",
        (state) => {
            if (!state.domain) {
                throw new Error("Router did not determine a domain");
            }

            return state.domain;
        },
        {
            [DOMAIN.ORDER]: "order",
            [DOMAIN.TICKET]: "ticket",
            [DOMAIN.PRODUCT]: "product",
        }
    )

    .addEdge("order", END)
    .addEdge("ticket", END)
    .addEdge("product", END)

    .compile({
        checkpointer: memory
    });