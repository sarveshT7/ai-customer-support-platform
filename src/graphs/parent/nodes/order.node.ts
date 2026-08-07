import { orderGraph } from "../../order/graph.js";
import { ParentState } from "../state.js";


export async function orderNode(state: typeof ParentState.State) {
    const result = await orderGraph.invoke({
        messages: state.messages,
    })
    return {
        messages: result.messages,
    };
}