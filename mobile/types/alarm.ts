export interface Alarm {
  _id: string;
  goal: string;
  startTime: string;
  startDate: string;
  proofMethod: 'photo' | 'ai_chat';
  status: 'upcoming' | 'in_progress' | 'completed' | 'failed';
}