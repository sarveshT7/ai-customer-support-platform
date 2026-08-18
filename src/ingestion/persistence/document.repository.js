import { db } from "../../database/kysely/db.js";
export class DocumentRepository {
    async createDocument(input) {
        return db
            .insertInto("documents")
            .values(input)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
}
