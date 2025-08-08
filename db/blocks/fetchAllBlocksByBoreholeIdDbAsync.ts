import { Block } from "@/interfaces/Block";
import { deserializeBlock } from "@/json/deserializeBlock";
import { db } from "../db";

export async function fetchAllBlocksByBoreholeIdDbAsync(boreholeId: number): Promise<Block[]> {
    const result = await db.getAllAsync('SELECT * FROM blocks WHERE boreholeId = ?', boreholeId);

    const blocks: Block[] = result.map((row: any): Block => {
        const block: Block = deserializeBlock(row);
        return {
            ...block,
            id: row.id,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    });
    return blocks;
}