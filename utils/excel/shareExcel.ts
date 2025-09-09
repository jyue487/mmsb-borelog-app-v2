import { Block } from "@/interfaces/Block";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";

export async function shareExcel(blocks: Block[]) {
    try {
        // Example data
        const data = [
            ["", "Q1", "Q2", "Q3", "Q4"],  // top header row
            ["Name", "Sales", "Sales", "Sales", "Sales"], // bottom header row
            ["Alice", 100, 120, 90, 110],
            ["Bob", 80, 95, 105, 130],
        ];

        // Create workbook
        const wb = XLSX.utils.book_new();
        // Create worksheet
        const ws1 = XLSX.utils.aoa_to_sheet(data);
        const ws2 = XLSX.utils.aoa_to_sheet([
            ["PROJ_ID", "LOCA_ID"],
            ['MM1234', 'BH1'],
        ]);

        // Add worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws1, "Sheet 1");
        XLSX.utils.book_append_sheet(wb, ws2, "Sheet 2");

        // Write workbook to base64
        const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

        // Create file path
        const uri = FileSystem.cacheDirectory + "example.xlsx";

        // Write file
        await FileSystem.writeAsStringAsync(uri, wbout, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Share file
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
            await Sharing.shareAsync(uri);
        } else {
            alert('Sharing is not available on this device');
        }

    } catch (err) {
        console.log(err);
        alert(err);
    }
}