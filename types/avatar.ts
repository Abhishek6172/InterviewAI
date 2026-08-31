/**
 * Avatar State and Configuration Types
 */

export type AvatarState = "idle" | "listening" | "thinking" | "speaking";

export type AvatarEmotion = "neutral" | "attentive" | "encouraging" | "analytical";

export interface AvatarStateConfig {
  state: AvatarState;
  emotion?: AvatarEmotion;
  isAudioActive?: boolean;
  audioVolumeLevel?: number; // 0.0 - 1.0 for visualizer reactivity
  captionText?: string;
}

export interface AvatarCustomization {
  personaName: string; // e.g. "Alex - Senior Engineering Lead"
  personaTitle: string;
  avatarStyle: "modern-minimal" | "cyber-hologram" | "warm-professional";
  primaryAccent: string;
  speechPitch: number;
  speechRate: number;
}
