export interface StravaSummaryActivity {
  id: number;
  name: string;
  sport_type?: string;
  type?: string;
  distance: number;
  moving_time: number;
  total_elevation_gain: number;
  average_speed?: number;
  average_heartrate?: number;
  average_watts?: number;
}

export interface StravaRiderProfile {
  activityCount: number;
  typicalDistanceKm: number;
  typicalMovingSpeedKph: number;
  typicalElevationGainMeters: number;
  climbRateMetersPerHour: number;
  averageHeartRate?: number;
  averageWatts?: number;
}

const cyclingSportTypes = new Set([
  "Ride",
  "MountainBikeRide",
  "GravelRide",
  "VirtualRide",
  "EMountainBikeRide",
]);

function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function average(values: number[]): number | undefined {
  const validValues = values.filter((value) => Number.isFinite(value) && value > 0);
  if (validValues.length === 0) {
    return undefined;
  }
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

export function filterMtbActivities(
  activities: StravaSummaryActivity[],
): StravaSummaryActivity[] {
  return activities.filter((activity) =>
    cyclingSportTypes.has(activity.sport_type ?? activity.type ?? ""),
  );
}

export function buildStravaRiderProfile(
  activities: StravaSummaryActivity[],
): StravaRiderProfile {
  const cyclingActivities = filterMtbActivities(activities);
  const distanceKm = average(cyclingActivities.map((activity) => activity.distance / 1000)) ?? 0;
  const speedKph =
    average(
      cyclingActivities.map((activity) =>
        activity.average_speed
          ? activity.average_speed * 3.6
          : activity.moving_time > 0
            ? (activity.distance / activity.moving_time) * 3.6
            : 0,
      ),
    ) ?? 0;
  const elevationGain =
    average(cyclingActivities.map((activity) => activity.total_elevation_gain)) ?? 0;
  const climbRate =
    average(
      cyclingActivities.map((activity) =>
        activity.moving_time > 0
          ? activity.total_elevation_gain / (activity.moving_time / 3600)
          : 0,
      ),
    ) ?? 0;
  const heartRate = average(
    cyclingActivities.map((activity) => activity.average_heartrate ?? 0),
  );
  const watts = average(cyclingActivities.map((activity) => activity.average_watts ?? 0));

  return {
    activityCount: cyclingActivities.length,
    typicalDistanceKm: round(distanceKm, 1),
    typicalMovingSpeedKph: round(speedKph, 1),
    typicalElevationGainMeters: Math.round(elevationGain),
    climbRateMetersPerHour: Math.round(climbRate),
    averageHeartRate: heartRate ? Math.round(heartRate) : undefined,
    averageWatts: watts ? Math.round(watts) : undefined,
  };
}
