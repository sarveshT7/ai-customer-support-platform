export async function ticketToolResultNode(state) {
    const lastMessage = state.messages.at(-1);
    if (lastMessage?._getType?.() === "tool" &&
        String(lastMessage.content).startsWith("Error:")) {
        return {
            ticket: {
                requested: state.ticket.requested,
                created: false,
            },
        };
    }
    return {};
}
