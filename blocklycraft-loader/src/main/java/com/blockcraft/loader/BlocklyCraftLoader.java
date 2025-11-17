package com.blockcraft.loader;

import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientLifecycleEvents;
import net.minecraft.client.MinecraftClient;
import net.minecraft.text.Text;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class BlocklyCraftLoader implements ModInitializer {
    public static final String MOD_ID = "blockcraftloader";
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);

    private static final String SERVER_URL = "http://10.248.110.111:5000";
    private static boolean modsDownloaded = false;

    @Override
    public void onInitialize() {
        LOGGER.info("[BlocklyCraft Loader] Initializing...");

        // Register client start event
        ClientLifecycleEvents.CLIENT_STARTED.register(this::onClientStart);
    }

    private void onClientStart(MinecraftClient client) {
        LOGGER.info("[BlocklyCraft Loader] Client started, checking for mods...");

        // Run in background thread to avoid blocking
        new Thread(() -> {
            try {
                ModDownloader downloader = new ModDownloader(SERVER_URL);
                int downloadedCount = downloader.checkAndDownloadMods();

                if (downloadedCount > 0) {
                    modsDownloaded = true;

                    LOGGER.info("[BlocklyCraft Loader] Downloaded {} new mod(s), starting countdown...", downloadedCount);

                    // Start countdown and auto-quit
                    startCountdownAndQuit(client, downloadedCount);
                } else {
                    LOGGER.info("[BlocklyCraft Loader] All mods up to date");
                }
            } catch (Exception e) {
                LOGGER.error("[BlocklyCraft Loader] Error checking mods: {}", e.getMessage());
            }
        }, "BlocklyCraft-Loader-Thread").start();
    }

    private void startCountdownAndQuit(MinecraftClient client, int downloadedCount) {
        try {
            // Initial message
            client.execute(() -> {
                if (client.player != null) {
                    client.player.sendMessage(
                        Text.literal("§a✨ Downloaded " + downloadedCount + " new mod(s)!"),
                        false
                    );
                }
            });

            Thread.sleep(1000);

            // Show countdown message
            client.execute(() -> {
                if (client.player != null) {
                    client.player.sendMessage(
                        Text.literal("§e⏰ Restarting in 5 seconds..."),
                        false
                    );
                }
            });

            // Countdown from 5 to 1
            for (int i = 5; i >= 1; i--) {
                final int countdown = i;
                client.execute(() -> {
                    if (client.player != null) {
                        client.player.sendMessage(
                            Text.literal("§c" + countdown + "..."),
                            true  // Show in action bar
                        );
                    }
                });

                Thread.sleep(1000);
            }

            // Final message and quit
            client.execute(() -> {
                if (client.player != null) {
                    client.player.sendMessage(
                        Text.literal("§a✓ Restarting! Click 'Play' again to load new mods!"),
                        false
                    );
                }
            });

            Thread.sleep(500);

            // Quit Minecraft
            client.execute(() -> {
                client.stop();
            });

        } catch (InterruptedException e) {
            LOGGER.error("[BlocklyCraft Loader] Countdown interrupted: {}", e.getMessage());
        }
    }
}
