import { model } from "../../llm/model.js";
import { searchProductsTool } from "../../tools/searchProducts.tool.js";
export const productModel = model.bindTools([
    searchProductsTool
]);
