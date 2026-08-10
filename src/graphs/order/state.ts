import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export const SupportState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (current, update) => current.concat(update),
        default: () => [],
    }),

    cancellation: Annotation<{
        requested: boolean;
        orderId?: string;
        approved?: boolean;
    }>({
        reducer: (_, update) => update,
        default: () => ({
            requested: false,
        }),
    }),
});