import { SupportState } from "../state.js";

export async function ticketToolResultNode(
    state: typeof SupportState.State
): Promise<Partial<typeof SupportState.State>> {
    const lastMessage = state.messages.at(-1);

    if (
        lastMessage?._getType?.() === "tool" &&
        String(lastMessage.content).startsWith("Error:")
    ) {
        return {
            ticket: {
                requested: state.ticket.requested,
                created: false,
            },
        };
    }

    return {};
}