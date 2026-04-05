// ============================================
// SUNFLOWER LAND API UTILITIES
// ============================================

export interface FarmLookupResult {
  success: boolean;
  farm_id?: string;
  username?: string;
  error?: string;
}

/**
 * Look up a farm by ID using the public SFL API
 * GET https://sfl.world/api/farm/{farmId}
 */
export async function lookupFarm(farmId: string): Promise<FarmLookupResult> {
  try {
    const response = await fetch(`https://sfl.world/api/farm/${farmId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'FARM_NOT_FOUND' };
      }
      return { success: false, error: 'API_ERROR' };
    }

    const data = await response.json();

    return {
      success: true,
      farm_id: data.farm_id ?? farmId,
      username: data.username ?? data.name ?? data.owner ?? null,
    };
  } catch {
    // Network error or invalid JSON
    return { success: false, error: 'NETWORK_ERROR' };
  }
}

/**
 * Extracts the numeric Farm ID from various formats.
 * SFL farm IDs are numeric strings.
 */
export function normalizeFarmId(raw: string): string {
  return raw.trim().replace(/[^0-9]/g, '');
}
