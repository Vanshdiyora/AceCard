export interface PipelinePoint {
  month: string;
  value: number;
}

export interface PiePoint {
  name: string;
  value: number;
  [key: string]: unknown;
}


export interface DashboardState {
  stats: {
    pipelineGenerated: number;
    leadsCaptured: number;
    totalCardTaps: number;
    ratio: number;
  };
  pipeline: PipelinePoint[];
  leadDistribution: PiePoint[];
}
