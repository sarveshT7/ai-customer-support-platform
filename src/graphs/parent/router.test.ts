import { describe, expect, it } from "vitest";
import { DOMAIN, detectDomain } from "./router.js";

describe("detectDomain", () => {
    it("routes a message mentioning both an order and damage to ticket", () => {
        expect(
            detectDomain("My order ORD-1001 arrived damaged, please help"),
        ).toBe(DOMAIN.TICKET);
    });

    it("routes a message mentioning both an order and a refund to ticket", () => {
        expect(
            detectDomain("I'd like a refund for my order ORD-1001"),
        ).toBe(DOMAIN.TICKET);
    });

    it("still routes a plain order status question to order", () => {
        expect(
            detectDomain("What is the status of my order ORD-1001?"),
        ).toBe(DOMAIN.ORDER);
    });

    it("still routes a cancellation request to order", () => {
        expect(
            detectDomain("Please cancel order ORD-1001"),
        ).toBe(DOMAIN.ORDER);
    });

    it("routes a plain ticket request to ticket", () => {
        expect(
            detectDomain("I want to raise a support ticket for ORD-1001"),
        ).toBe(DOMAIN.TICKET);
    });

    it("falls back to product for anything else", () => {
        expect(
            detectDomain("What laptops do you have under 70000 rupees?"),
        ).toBe(DOMAIN.PRODUCT);
    });
});
