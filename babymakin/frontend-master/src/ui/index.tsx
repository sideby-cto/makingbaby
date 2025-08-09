import React from "react";
import { AppRoutes } from "./AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const UIRoot = () => (
  <React.Fragment>
    <AppRoutes />
    <ToastContainer position="top-right" />
  </React.Fragment>
);
