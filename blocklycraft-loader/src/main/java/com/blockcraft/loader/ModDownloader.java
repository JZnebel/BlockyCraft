package com.blockcraft.loader;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ModDownloader {
    private final String serverUrl;
    private final Path modsDir;
    private final Gson gson = new Gson();

    public ModDownloader(String serverUrl) {
        this.serverUrl = serverUrl;
        // Get the .minecraft/mods directory
        // FabricLoader.getInstance().getGameDir() would be better but requires dependency
        // Using standard Minecraft location works for all clients
        String userHome = System.getProperty("user.home");
        this.modsDir = Paths.get(userHome, ".minecraft", "mods");
    }

    public int checkAndDownloadMods() throws Exception {
        // Fetch manifest from server
        JsonObject manifest = fetchManifest();
        if (manifest == null || !manifest.get("success").getAsBoolean()) {
            BlocklyCraftLoader.LOGGER.warn("[BlocklyCraft Loader] Failed to fetch manifest");
            return 0;
        }

        JsonArray mods = manifest.getAsJsonArray("mods");
        int downloadedCount = 0;

        // Get list of currently installed BlocklyCraft mods
        Map<String, String> installedMods = getInstalledBlocklyCraftMods();

        for (JsonElement modElement : mods) {
            JsonObject mod = modElement.getAsJsonObject();
            String filename = mod.get("filename").getAsString();
            String sha1 = mod.get("sha1").getAsString();
            String downloadUrl = mod.get("download_url").getAsString();

            // Check if mod is already installed and up-to-date
            if (installedMods.containsKey(filename)) {
                String installedSha1 = installedMods.get(filename);
                if (installedSha1.equals(sha1)) {
                    BlocklyCraftLoader.LOGGER.info("[BlocklyCraft Loader] Mod up-to-date: {}", filename);
                    continue;
                }
                BlocklyCraftLoader.LOGGER.info("[BlocklyCraft Loader] Mod needs update: {}", filename);
            } else {
                BlocklyCraftLoader.LOGGER.info("[BlocklyCraft Loader] New mod found: {}", filename);
            }

            // Download the mod
            if (downloadMod(downloadUrl, filename)) {
                downloadedCount++;
                BlocklyCraftLoader.LOGGER.info("[BlocklyCraft Loader] Downloaded: {}", filename);
            }
        }

        return downloadedCount;
    }

    private JsonObject fetchManifest() {
        try {
            URL url = new URL(serverUrl + "/api/mods-manifest");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            int responseCode = conn.getResponseCode();
            if (responseCode == 200) {
                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                String inputLine;
                StringBuilder content = new StringBuilder();
                while ((inputLine = in.readLine()) != null) {
                    content.append(inputLine);
                }
                in.close();
                conn.disconnect();

                return gson.fromJson(content.toString(), JsonObject.class);
            }
        } catch (Exception e) {
            BlocklyCraftLoader.LOGGER.error("[BlocklyCraft Loader] Error fetching manifest: {}", e.getMessage());
        }
        return null;
    }

    private Map<String, String> getInstalledBlocklyCraftMods() {
        Map<String, String> installed = new HashMap<>();

        try {
            if (!Files.exists(modsDir)) {
                return installed;
            }

            Files.list(modsDir)
                .filter(path -> path.getFileName().toString().startsWith("blockcraft-"))
                .filter(path -> path.getFileName().toString().endsWith(".jar"))
                .forEach(path -> {
                    try {
                        String filename = path.getFileName().toString();
                        String sha1 = calculateSHA1(path);
                        installed.put(filename, sha1);
                    } catch (Exception e) {
                        BlocklyCraftLoader.LOGGER.error("[BlocklyCraft Loader] Error checking mod: {}", e.getMessage());
                    }
                });
        } catch (Exception e) {
            BlocklyCraftLoader.LOGGER.error("[BlocklyCraft Loader] Error listing mods: {}", e.getMessage());
        }

        return installed;
    }

    private boolean downloadMod(String downloadUrl, String filename) {
        try {
            URL url = new URL(downloadUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);

            int responseCode = conn.getResponseCode();
            if (responseCode == 200) {
                // Download to temp file first
                Path tempFile = Files.createTempFile("blockcraft-", ".jar");
                try (InputStream in = conn.getInputStream()) {
                    Files.copy(in, tempFile, StandardCopyOption.REPLACE_EXISTING);
                }

                // Move to mods directory
                Path targetPath = modsDir.resolve(filename);
                Files.move(tempFile, targetPath, StandardCopyOption.REPLACE_EXISTING);

                conn.disconnect();
                return true;
            }
        } catch (Exception e) {
            BlocklyCraftLoader.LOGGER.error("[BlocklyCraft Loader] Error downloading mod {}: {}", filename, e.getMessage());
        }
        return false;
    }

    private String calculateSHA1(Path file) throws Exception {
        MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
        try (InputStream fis = Files.newInputStream(file)) {
            byte[] buffer = new byte[8192];
            int read;
            while ((read = fis.read(buffer)) != -1) {
                sha1.update(buffer, 0, read);
            }
        }

        byte[] digest = sha1.digest();
        StringBuilder result = new StringBuilder();
        for (byte b : digest) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}
