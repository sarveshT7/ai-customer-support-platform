import { tool } from "@langchain/core/tools";
import z from "zod";
import { ticketService } from "../services/ticket.service.js";
import { withRetry } from "../lib/retry.js";

export const getTicketTool = tool(
    async ({ ticketId }: { ticketId: string }) => {
        return withRetry(() => ticketService.getTicket(ticketId));
    },
    {
        name: "get_ticket",
        description: "Retrieve support ticket details, including its status, using a ticket ID.",
        schema: z.object({
            ticketId: z.string().describe("The customer's ticket ID, for example TKT-xxxxxxxx."),
        }),
    }
);
