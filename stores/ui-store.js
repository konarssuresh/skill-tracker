import { create } from "zustand";

export const useUiStore = create((set) => ({
  isCreateSkillDialogOpen: false,
  isLogSessionDialogOpen: false,
  openCreateSkillDialog: () =>
    set({
      isCreateSkillDialogOpen: true,
    }),
  closeCreateSkillDialog: () =>
    set({
      isCreateSkillDialogOpen: false,
    }),
  openLogSessionDialog: () =>
    set({
      isLogSessionDialogOpen: true,
    }),
  closeLogSessionDialog: () =>
    set({
      isLogSessionDialogOpen: false,
    }),
}));
