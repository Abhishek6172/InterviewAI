export type AvatarState = "idle" | "speaking" | "listening" | "thinking";

export interface AvatarStateConfig {
  state: AvatarState;
  glowColor: string;
  ringAnimation: string;
  orbGradient: string;
  statusLabel: string;
  statusColor: string;
}

export interface AvatarAudioVisualizerProps {
  state: AvatarState;
  barCount?: number;
  className?: string;
}

export interface AIPersona {
  id: string;
  name: string; // e.g. "Sara"
  roleTitle: string; // e.g. "Senior Technical Interviewer"
  avatarImage?: string;
  personalityStyle: "empathetic" | "rigorous" | "balanced";
}
