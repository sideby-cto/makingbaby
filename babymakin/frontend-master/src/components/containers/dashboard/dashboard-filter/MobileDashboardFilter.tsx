import { FC, useState } from "react";
import { DashboardFilterOptionsProps } from "./dashboardUtils";
import { CgArrowDown, CgArrowUp } from "react-icons/cg";
import { FormSubmitButton } from "../../../buttons";

interface MobileDashboardFilterProps extends DashboardFilterOptionsProps {
  onClickApplyHandler: () => void;
}

export const MobileDashboardFilter: FC<MobileDashboardFilterProps> = ({
  options,
  onClickApplyHandler,
}) => {
  const [mobileFilterIsOpened, setMobileFilterState] = useState<boolean>(false);
  return (
    <div className="lg:hidden w-full border-gray-950 border-2 p-2 rounded-md flex flex-col items-center">
      <div
        className="justify-center cursor-pointer"
        onClick={() => setMobileFilterState((prev) => !prev)}
      >
        <div className="flex items-center	">
          <h1 className="text-gray-400">
            {mobileFilterIsOpened ? "Hide" : "Show"} Filters
          </h1>
          {mobileFilterIsOpened ? (
            <CgArrowUp color="rgb(156 163 175)" />
          ) : (
            <CgArrowDown color="rgb(156 163 175)" />
          )}
        </div>
      </div>
      <div
        className="block overflow-hidden gap-3"
        style={
          mobileFilterIsOpened
            ? { maxHeight: "100rem", transition: "max-height 0.5s ease-out" }
            : { maxHeight: "0rem", transition: "max-height 0.5s ease-in" }
        }
      >
        <>
          {options.map(({ component: filter }, idx) => (
            <div className="pt-4" key={idx}>
              {filter}
            </div>
          ))}
        </>
        <FormSubmitButton
          title="Apply Filters"
          backgroundColor="#008080"
          containerStyle="w-full mt-8 mb-3 py-3 px-3 rounded-lg flex justify-center items-center text-[12px] font-interBold text-white"
          type="button"
          onClick={() => {
            onClickApplyHandler();
            setMobileFilterState((prev) => !prev);
          }}
        />
      </div>
    </div>
  );
};
