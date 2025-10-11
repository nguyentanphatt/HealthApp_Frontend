import { useModalStore } from '@/stores/useModalStore';
import React from 'react';
import ActionModal from './modal/ActionModal';
import DeleteModal from './modal/DeleteModal';
import ImagePreviewModal from './modal/ImageViewModal';
import TimeWheelModal from './modal/TimePickerModal';
import WaterWheelModal from './modal/WaterWheelModal';

const GlobalModal = () => {
    const { modalType, modalProps, openModal, closeModal } = useModalStore();

    if (modalType === null) return null;

    switch (modalType) {
        case "waterwheel": {
            return <WaterWheelModal  {...modalProps} closeModal={closeModal} />
        }

        case "action": {
            return <ActionModal  {...modalProps} closeModal={closeModal} />
        }

        case "imageview": {
            return <ImagePreviewModal  {...modalProps} closeModal={closeModal} />
        }

        case "timepicker": {
            return <TimeWheelModal  {...modalProps} closeModal={closeModal} />
        }
        case "delete": {
            return <DeleteModal  {...modalProps} closeModal={closeModal} />
        }

        default: {
            return null;
        }
    }
}

export default GlobalModal