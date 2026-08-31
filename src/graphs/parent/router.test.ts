import { describe, expect, it } from "vitest";
import { DOMAIN, detectDomainHeuristic } from "./router.js";

describe("detectDomainHeuristic", () => {
    it("routes a message mentioning both an order and damage to ticket", () => {
        expect(
            detectDomainHeuristic("My order ORD-1001 arrived damaged, please help"),
        ).toBe(DOMAIN.TICKET);
    });

    it("routes a message mentioning both an order and a refund to ticket", () => {
        expect(
            detectDomainHeuristic("I'd like a refund for my order ORD-1001"),
        ).toBe(DOMAIN.TICKET);
    });

    it("still routes a plain order status question to order", () => {
        expect(
            detectDomainHeuristic("What is the status of my order ORD-1001?"),
        ).toBe(DOMAIN.ORDER);
    });

    it("still routes a cancellation request to order", () => {
        expect(
            detectDomainHeuristic("Please cancel order ORD-1001"),
        ).toBe(DOMAIN.ORDER);
    });

    it("routes a plain ticket request to ticket", () => {
        expect(
            detectDomainHeuristic("I want to raise a support ticket for ORD-1001"),
        ).toBe(DOMAIN.TICKET);
    });

    it("returns undefined (no confident signal) for anything else", () => {
        expect(
            detectDomainHeuristic("What laptops do you have under 70000 rupees?"),
        ).toBeUndefined();
    });

    it("does not false-positive on 'order' as a substring of an unrelated word", () => {
        expect(
            detectDomainHeuristic("Can you play that recorder demo again?"),
        ).toBeUndefined();
        expect(
            detectDomainHeuristic("Do you ship across the border?"),
        ).toBeUndefined();
    });

    it("does not treat a negated mention of a ticket keyword as a signal", () => {
        expect(
            detectDomainHeuristic("No issues here, everything is fine, thanks"),
        ).toBeUndefined();
    });

    it("does not treat a general policy question mentioning 'damaged' as a ticket", () => {
        // Regression: this used to route to the ticket domain (no RAG access), which then
        // fabricated a wrong policy answer instead of deferring to the product/RAG domain.
        expect(
            detectDomainHeuristic("How long do I have to return a damaged product?"),
        ).toBeUndefined();
    });

    it("does not treat a general refund-policy question as a ticket", () => {
        expect(detectDomainHeuristic("What's your refund policy?")).toBeUndefined();
    });

    it("still routes a first-person incident report to ticket even without the word 'ticket'", () => {
        expect(
            detectDomainHeuristic("I have an issue with my last order"),
        ).toBe(DOMAIN.TICKET);
        expect(detectDomainHeuristic("Order ORD-1001 damaged")).toBe(DOMAIN.TICKET);
    });

    it("does not treat a bare 'my' in a general refund question as a personal-incident signal", () => {
        // Regression: "get my refund" was matching a too-permissive "my" check and routing to
        // the ticket domain (no RAG access), which then fabricated a wrong, unattributed answer
        // instead of citing the actual 5-business-day refund-processing policy.
        expect(
            detectDomainHeuristic(
                "How many days after buying something can I get my refund?",
            ),
        ).toBeUndefined();
    });
});
