export interface BottleneckAlert {
  id: string;
  type: 'PACKING_CONGESTION' | 'PICKER_OVERLOAD' | 'ZONE_DENSITY' | 'DOCK_CONGESTION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  stationCode?: string;
  queueDepth: number;
  avgProcessingTimeMin: number;
  baselineProcessingTimeMin: number;
  delayImpactMinutes: number;
  description: string;
  recommendation: string;
  actionPayload?: {
    sourceStation?: string;
    targetStation?: string;
    actionType: string;
  };
}

export class BottleneckEngine {
  /**
   * Evaluates station queues, velocity metrics, and resource distribution to detect operational bottlenecks
   */
  public static analyzePackingStations(stations: {
    id: string;
    stationCode: string;
    workerName: string;
    queueDepth: number;
    avgPackingTimeMin: number;
    status: string;
  }[]): BottleneckAlert[] {
    const alerts: BottleneckAlert[] = [];
    const baselineMin = 5.2;

    for (const st of stations) {
      // Overloaded condition: queue > 10 or processing time > 7.0 min
      if (st.queueDepth >= 10 || st.avgPackingTimeMin >= 7.0 || st.status === 'OVERLOADED') {
        const excessQueue = Math.max(1, st.queueDepth - 4);
        const delayImpact = Math.round(excessQueue * (st.avgPackingTimeMin - 2.5) + (st.avgPackingTimeMin - baselineMin) * 8);

        // Find an underutilized or available station to source help from
        const idleStation = stations.find(
          (s) => s.stationCode !== st.stationCode && (s.queueDepth <= 2 || s.status === 'AVAILABLE' || s.status === 'WAITING')
        );

        const sourceStationCode = idleStation ? idleStation.stationCode : 'P01';

        alerts.push({
          id: `BOTTLENECK-${st.stationCode}`,
          type: 'PACKING_CONGESTION',
          severity: st.queueDepth >= 15 ? 'CRITICAL' : 'HIGH',
          location: `Packing Station ${st.stationCode}`,
          stationCode: st.stationCode,
          queueDepth: st.queueDepth,
          avgProcessingTimeMin: st.avgPackingTimeMin,
          baselineProcessingTimeMin: baselineMin,
          delayImpactMinutes: delayImpact,
          description: `Packing Station ${st.stationCode} queue is backlogged with ${st.queueDepth} orders. Average packing cycle time is ${st.avgPackingTimeMin.toFixed(1)} min (Baseline: ${baselineMin} min).`,
          recommendation: `Move 1 packer from ${sourceStationCode} to ${st.stationCode} and activate dual-scanner station throughput mode.`,
          actionPayload: {
            sourceStation: sourceStationCode,
            targetStation: st.stationCode,
            actionType: 'REALLOCATE_PACKER',
          },
        });
      }
    }

    return alerts;
  }
}
