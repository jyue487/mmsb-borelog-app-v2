import { Borehole } from "@/interfaces/Borehole";
import { db } from "../db";

export async function fetchBoreholeByIdAsync(boreholeId: number): Promise<Borehole> {
    const result: Borehole | null = await db.getFirstAsync<Borehole>('SELECT * FROM boreholes WHERE id = ?', boreholeId);
    if (!result) {
        throw new Error(`Error. No such borehole.`);
    }
    return result;
}