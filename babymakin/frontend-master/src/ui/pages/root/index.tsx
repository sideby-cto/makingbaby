import { Outlet } from "react-router-dom";
import { useRootLayout } from "../../../hooks/useRootLayout";
import { RenderIf } from "../../lib";
import { Navbar } from "../../sharedComponents";

export const RootLayout = () => {
  const { isAuthenticated } = useRootLayout();

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      {RenderIf(isAuthenticated, <Navbar />)}
      <div className="pt-20 lg:pt-0 w-full	">
        <Outlet />
      </div>
    </div>
  );
};
