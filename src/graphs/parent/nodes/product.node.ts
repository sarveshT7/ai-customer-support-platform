import { ParentState } from "../state.js";
import { productGraph } from "../../product/graph.js";

export async function productNode(
    state: typeof ParentState.State
) {
    const result = await productGraph.invoke({
        messages: state.messages,
    });

    return {
        messages: result.messages,
    };
}