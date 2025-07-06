import { Router } from "express";
import fs from "fs/promises";
import path from "path";

const router = Router();

const ASSETS_DIR = path.join(process.cwd(), "attached_assets");

// Get list of all attached assets
router.get("/", async (req, res) => {
  try {
    const files = await fs.readdir(ASSETS_DIR);
    const assets = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(ASSETS_DIR, filename);
        const stats = await fs.stat(filePath);
        
        return {
          filename,
          path: `/attached_assets/${filename}`,
          size: stats.size,
          lastModified: stats.mtime.getTime(),
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory()
        };
      })
    );

    // Filter only files
    const fileAssets = assets.filter(asset => asset.isFile);

    res.json(fileAssets);
  } catch (error) {
    console.error("Error reading attached assets:", error);
    res.status(500).json({ error: "Failed to read attached assets" });
  }
});

// Get content of a specific asset
router.get("/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(ASSETS_DIR, filename);

    // Security check - ensure file is within assets directory
    const resolvedPath = path.resolve(filePath);
    const resolvedAssetsDir = path.resolve(ASSETS_DIR);
    
    if (!resolvedPath.startsWith(resolvedAssetsDir)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if file exists
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      return res.status(404).json({ error: "File not found" });
    }

    // Determine content type
    const extension = path.extname(filename).toLowerCase();
    let contentType = "text/plain";
    
    if ([".json"].includes(extension)) {
      contentType = "application/json";
    } else if ([".md"].includes(extension)) {
      contentType = "text/markdown";
    } else if ([".csv"].includes(extension)) {
      contentType = "text/csv";
    } else if ([".png", ".jpg", ".jpeg"].includes(extension)) {
      contentType = `image/${extension.slice(1)}`;
    }

    // For text-based files, return content as text
    if (contentType.startsWith("text/") || contentType === "application/json") {
      const content = await fs.readFile(filePath, "utf-8");
      res.setHeader("Content-Type", contentType);
      res.send(content);
    } else {
      // For binary files, send as buffer
      const content = await fs.readFile(filePath);
      res.setHeader("Content-Type", contentType);
      res.send(content);
    }
  } catch (error) {
    console.error(`Error reading asset ${req.params.filename}:`, error);
    res.status(500).json({ error: "Failed to read asset" });
  }
});

// Search assets by filename or content
router.post("/search", async (req, res) => {
  try {
    const { query, type } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const files = await fs.readdir(ASSETS_DIR);
    const matchingAssets = [];

    for (const filename of files) {
      const filePath = path.join(ASSETS_DIR, filename);
      const stats = await fs.stat(filePath);
      
      if (!stats.isFile()) continue;

      let matches = false;

      // Check filename match
      if (filename.toLowerCase().includes(query.toLowerCase())) {
        matches = true;
      }

      // For text files, check content match
      const extension = path.extname(filename).toLowerCase();
      if ([".txt", ".md", ".json", ".csv", ".log"].includes(extension)) {
        try {
          const content = await fs.readFile(filePath, "utf-8");
          if (content.toLowerCase().includes(query.toLowerCase())) {
            matches = true;
          }
        } catch (error) {
          // Skip if can't read content
        }
      }

      if (matches) {
        matchingAssets.push({
          filename,
          path: `/attached_assets/${filename}`,
          size: stats.size,
          lastModified: stats.mtime.getTime(),
          type: extension
        });
      }
    }

    res.json(matchingAssets);
  } catch (error) {
    console.error("Error searching assets:", error);
    res.status(500).json({ error: "Failed to search assets" });
  }
});

// Get asset metadata and statistics
router.get("/meta/stats", async (req, res) => {
  try {
    const files = await fs.readdir(ASSETS_DIR);
    const stats = {
      total: 0,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      totalSize: 0
    };

    for (const filename of files) {
      const filePath = path.join(ASSETS_DIR, filename);
      const fileStats = await fs.stat(filePath);
      
      if (!fileStats.isFile()) continue;

      stats.total++;
      stats.totalSize += fileStats.size;

      // Count by file extension
      const extension = path.extname(filename).toLowerCase();
      stats.byType[extension] = (stats.byType[extension] || 0) + 1;

      // Count by category (based on filename)
      let category = "other";
      if (filename.toLowerCase().includes("cursor")) category = "cursor";
      else if (filename.toLowerCase().includes("bolt")) category = "bolt";
      else if (filename.toLowerCase().includes("replit")) category = "replit";
      else if (filename.toLowerCase().includes("windsurf")) category = "windsurf";
      else if (filename.toLowerCase().includes("lovable")) category = "lovable";
      else if (filename.toLowerCase().includes("mcp")) category = "mcp";
      else if (filename.toLowerCase().includes("rag")) category = "rag";
      else if (filename.toLowerCase().includes("a2a")) category = "a2a";

      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    }

    res.json(stats);
  } catch (error) {
    console.error("Error getting asset stats:", error);
    res.status(500).json({ error: "Failed to get asset statistics" });
  }
});

export default router;