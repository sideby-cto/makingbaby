import React, { useState } from "react";
import { UserType } from "../utils/types";
import { LoggedInUserProvider, ModalDataContext } from "./contexts";

interface Props {
  children: React.ReactNode;
}

export const ModalProvider: React.FC<Props> = (props) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [modalData, setModalData] = useState<any>([]);
  return (
    <LoggedInUserProvider.Provider value={[user, setUser]}>
      <ModalDataContext.Provider value={[modalData, setModalData]}>
        {props.children}
      </ModalDataContext.Provider>
    </LoggedInUserProvider.Provider>
  );
};
