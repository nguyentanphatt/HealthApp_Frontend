import { create } from "zustand";

type ModalType = "waterwheel" | "action" | "imageview" | "timepicker" | "delete" | null

type ModalState = {
    modalType: ModalType;
    modalProps: any;
    openModal: (modalType: ModalType, modalProps: any) => void;
    closeModal: () => void;
}

export const useModalStore = create<ModalState>()((set) => ({
    modalType: null,
    modalProps: null,
    openModal: (modalType, modalProps) => set({ modalType, modalProps }),
    closeModal: () => set({ modalType: null, modalProps: null }),
}))