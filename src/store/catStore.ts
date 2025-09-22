'use client';

import { create } from 'zustand';
import { VirtualCat } from '@/lib/cat';
import { getCatConfigById } from '@/lib/catConfigs';
import { ChatMessage } from '@/types/cat';

interface CatStore {
  currentCat: VirtualCat | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  selectCat: (catId: string) => void;
  performAction: (actionId: string) => void;
  addMessage: (content: string, isUser: boolean) => void;
  generateCatResponse: (userMessage: string) => string;
  resetError: () => void;
}

export const useCatStore = create<CatStore>((set, get) => ({
  currentCat: null,
  isLoading: false,
  error: null,

  selectCat: (catId: string) => {
    set({ isLoading: true, error: null });
    
    const config = getCatConfigById(catId);
    if (!config) {
      set({ error: '找不到指定的猫咪', isLoading: false });
      return;
    }

    const cat = new VirtualCat(config);
    set({ currentCat: cat, isLoading: false });
  },

  performAction: (actionId: string) => {
    const { currentCat } = get();
    if (!currentCat) {
      set({ error: '没有选择猫咪' });
      return;
    }

    const action = currentCat.performAction(actionId);
    if (!action) {
      set({ error: '无效的动作' });
      return;
    }

    set({ currentCat, error: null });
  },

  addMessage: (content: string, isUser: boolean) => {
    const { currentCat } = get();
    if (!currentCat) {
      set({ error: '没有选择猫咪' });
      return;
    }

    const message: ChatMessage = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      isUser
    };

    currentCat.addMessage(message);
    set({ currentCat, error: null });
  },

  generateCatResponse: (userMessage: string) => {
    const { currentCat } = get();
    if (!currentCat) {
      set({ error: '没有选择猫咪' });
      return '';
    }

    return currentCat.generateResponse(userMessage);
  },

  resetError: () => {
    set({ error: null });
  }
}));