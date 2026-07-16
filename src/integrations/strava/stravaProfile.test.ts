import { describe, expect, it } from "vitest";
import { buildStravaRiderProfile, filterMtbActivities } from "./stravaProfile";

const activities = [
  {
    id: 1,
    name: "Trail loop",
    sport_type: "MountainBikeRide",
    distance: 18500,
    moving_time: 4200,
    total_elevation_gain: 520,
    average_speed: 4.4,
    average_heartrate: 142,
    average_watts: 176,
  },
  {
    id: 2,
    name: "Road spin",
    sport_type: "Ride",
    distance: 28000,
    moving_time: 5400,
    total_elevation_gain: 310,
    average_speed: 5.2,
  },
  {
    id: 3,
    name: "Jog",
    sport_type: "Run",
    distance: 5000,
    moving_time: 1800,
    total_elevation_gain: 40,
    average_speed: 2.8,
  },
];

describe("Strava rider profile", () => {
  it("keeps cycling and mountain bike activities for MTB profiling", () => {
    expect(filterMtbActivities(activities).map((activity) => activity.name)).toEqual([
      "Trail loop",
      "Road spin",
    ]);
  });

  it("builds rider-specific MTB targets from recent activities", () => {
    const profile = buildStravaRiderProfile(activities);

    expect(profile.activityCount).toBe(2);
    expect(profile.typicalDistanceKm).toBe(23.3);
    expect(profile.typicalMovingSpeedKph).toBe(17.3);
    expect(profile.typicalElevationGainMeters).toBe(415);
    expect(profile.climbRateMetersPerHour).toBe(326);
    expect(profile.averageHeartRate).toBe(142);
    expect(profile.averageWatts).toBe(176);
  });
});
