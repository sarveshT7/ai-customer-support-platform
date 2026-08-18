import { detectDomain } from "../router.js";
export async function routerNode(state) {
    if (!state?.messages || state.messages.length === 0) {
        throw new Error("Parent graph received no messages.");
    }
    const lastMessage = state.messages[state.messages.length - 1];
    const domain = detectDomain(lastMessage.content.toString());
    return { domain };
}
