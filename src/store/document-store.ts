"use client";

import { create } from 'zustand';

type DocumentState = {
  file: File | null;
  setFile: (file: File | null) => void;
};

export const useDocumentStore = create<DocumentState>((set) => ({
  file: null,
  setFile: (file) => set({ file }),
}));
