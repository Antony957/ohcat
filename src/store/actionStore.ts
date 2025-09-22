'use client';

import { create } from 'zustand';
import { CatAction } from '@/types/cat';

interface ActionStore {
  // 动作触发事件
  actionTrigger: {
    action: CatAction | null;
    timestamp: number;
  } | null;
  
  // Actions
  triggerAction: (action: CatAction) => void;
  clearTrigger: () => void;
}

export const useActionStore = create<ActionStore>((set) => ({
  actionTrigger: null,
  
  triggerAction: (action: CatAction) => {
    set({
      actionTrigger: {
        action,
        timestamp: Date.now()
      }
    });
  },
  
  clearTrigger: () => {
    set({ actionTrigger: null });
  }
}));