import { ticketGraph } from "../../ticket/graph.js";
import { ParentState } from "../state.js";


export async function ticketNode(state: typeof ParentState.State) {
    const result = await ticketGraph.invoke({
        messages: state.messages,
    })
    return {
        messages: result.messages,
    }
}