import { SYSTEM_PROMPT } from "../../../prompts/system.prompt.js";
import { productModel } from "../model.js";
export async function agentNode(state) {
    const response = await productModel.invoke([
        SYSTEM_PROMPT,
        ...state.messages,
    ]);
    console.log("Tool calls:", JSON.stringify(response.tool_calls, null, 2));
    return {
        messages: [response],
    };
}
