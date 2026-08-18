import { DocumentRow, NewDocumentRow } from "../../database/index.js";
import { db } from "../../database/kysely/db.js";

export class DocumentRepository {
    async createDocument(input: NewDocumentRow): Promise<DocumentRow> {
        return db
            .insertInto("documents")
            .values(input)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
}