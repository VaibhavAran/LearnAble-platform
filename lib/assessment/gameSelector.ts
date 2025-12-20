// lib/assessment/gameSelector.ts

export type GameConfig = {
  id: string;
  name: string;
  domain: 'attention' | 'memory' | 'processing';
};

export function getAssessmentGames(age: number): GameConfig[] {
  // Age: 1–3
  if (age <= 3) {
    return [
      { id: 'focus_tap', name: 'Tap the Star', domain: 'attention' },
      { id: 'memory_path', name: 'Follow the Path', domain: 'memory' },
    ];
  }

  // Age: 4–6
  if (age <= 6) {
    return [
      { id: 'focus_tap', name: 'Focus Tap', domain: 'attention' },
      { id: 'spot_difference', name: 'Spot the Difference', domain: 'processing' },
      { id: 'memory_path', name: 'Memory Path', domain: 'memory' },
    ];
  }

  // Age: 7–10
  return [
    { id: 'focus_tap', name: 'Focus Tap', domain: 'attention' },
    { id: 'spot_difference', name: 'Spot the Difference', domain: 'processing' },
    { id: 'memory_path', name: 'Memory Path', domain: 'memory' },
  ];
}
