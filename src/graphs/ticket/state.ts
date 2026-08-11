import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export const SupportState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (current, update) => current.concat(update),
        default: () => [],
    }),

    ticket: Annotation<{
        requested: boolean;
        orderId?: string;
        verified?: boolean;
        orderExists?: boolean;
        message?: string;
    }>({
        reducer: (current, update) => ({ ...current, ...update }),
        default: () => ({ requested: false })
    }),
});