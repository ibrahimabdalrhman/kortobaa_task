import fs from "fs/promises";

export async function deleteImage(filePath: string): Promise<void> {
  try {
    // Check if the file exists before attempting to delete it
    await fs.access(filePath);
    await fs.unlink(filePath);
    console.log(`File deleted: ${filePath}`);
  } catch (err) {
    // Handle errors, such as if the file does not exist or cannot be deleted
    console.error(`Error deleting file (${filePath}):`, err);
    throw err; // Optionally, you can re-throw the error for higher-level error handling
  }
}
