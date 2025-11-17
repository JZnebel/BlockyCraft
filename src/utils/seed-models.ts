import { dbSaveAiModel, dbGetAiModels } from './database';

// Pre-generated example models (empty - user generates their own)
const EXAMPLE_MODELS: any[] = [];

/**
 * Seed example AI models into the database on first run
 */
export async function seedExampleModels(): Promise<void> {
  try {
    const existingModels = await dbGetAiModels();
    const existingIds = new Set(existingModels.map(m => m.model_id));

    for (const model of EXAMPLE_MODELS) {
      // Only add if it doesn't already exist
      if (!existingIds.has(model.id)) {
        await dbSaveAiModel(
          model.id,
          model.name,
          model.prompt,
          JSON.stringify(model.blocks),
          'manual' // Mark as manually created
        );
        console.log(`Seeded example model: ${model.name}`);
      }
    }
  } catch (error) {
    console.error('Error seeding example models:', error);
  }
}
