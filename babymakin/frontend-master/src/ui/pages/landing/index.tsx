import { ProIcons } from "../../../assets/icons";
import { Loading } from "../../../components";
import { useLandingPage } from "../../../hooks";
import { RenderIf } from "../../lib";

export const LandingPage = () => {
  const { fetchingUser } = useLandingPage();
  return (
    <div className="flex flex-col h-full w-full items-center bg-[#E7EDE6] pt-20">
      <img src={ProIcons.ProLogo} alt="" className="h-10 w-10" />
      <h1 className="mt-5 md:text-xl text-[#008080] lg:text-lg text-base">
        Welcome to Small Wins Dashboard
      </h1>
      <div className="flex flex-col w-full h-full items-center justify-center">
        {RenderIf(
          fetchingUser,
          <>
            <Loading color="#008080" />
            <h1 className="text-[#008080] lg:text-md text-sm text-base">
              Setting up your dashboard
            </h1>
          </>
        )}
      </div>
    </div>
  );
};
