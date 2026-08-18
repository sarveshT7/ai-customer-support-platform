import { Annotation } from "@langchain/langgraph";
export const SupportState = Annotation.Root({
    messages: Annotation({
        reducer: (current, update) => current.concat(update),
        default: () => [],
    }),
    cancellation: Annotation({
        reducer: (_, update) => update,
        default: () => ({
            requested: false,
        }),
    }),
});
