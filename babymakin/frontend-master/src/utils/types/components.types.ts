import React from "react";

export type IHOCWrappedProps = {
  toggleVisibilityProps: {
    visible: boolean;
    toggleVisible: () => void;
  };
};

export type TabType =
  | "Dashboard"
  | "Users"
  | "Configuration"
  | "Teams"
  | "Comment Action";

export type ProviderType<T> = [
  T | null,
  React.Dispatch<React.SetStateAction<T | null>>
];
export type RefProviderType<T> = React.RefObject<T>;

export interface ModalProps {
  onCloseModalClick: () => void;
  type: "update" | "create";
  populatedData?: any;
  refetch: () => void;
}

export type KeyValueStateType<T> = {
  key: string;
  value: T | null;
};
