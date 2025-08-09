import React from "react";
import { FaUser } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { ProIcons } from "../../assets/icons";
import { COLORS } from "src/design-system";
import { useUserGlobalState } from "../../hooks/useUserGlobalState";

const { ProLogo } = ProIcons;

interface NavbarAvatarContainerProps {
  toggleNavbarState?: () => void;
}

export const NavbarAvatarContainer: React.FC<NavbarAvatarContainerProps> = ({
  toggleNavbarState,
}) => {
  const user = useUserGlobalState()[0];
  const { avatarTextColor } = COLORS.navbar;
  const defaultTextStyle = "font-interBold";
  const userName = user ? user.name.split(" ")[0] : "";
  return (
    <div className="flex flex-col w-full lg:w-52 overflow-hidden">
      <div className="flex w-full items-center justify-between lg:justify-start h-16 space-x-0">
        <div className="flex lg:hidden">
          <GiHamburgerMenu size="24px" onClick={() => toggleNavbarState?.()} />
        </div>
        <img src={ProLogo} alt="" className="h-10 pr-0 lg:pr-3" />
        <div className="hidden lg:flex flex-col">
          <span
            style={{ color: avatarTextColor }}
            className={`text-xl ${defaultTextStyle} `}
          >
            {userName}
          </span>
        </div>
      </div>
      <div className="flex flex-col space-y-2 mt-4 lg:hidden">
        <div className="flex items-center space-x-3">
          <div className="">
            <FaUser color={avatarTextColor} size="16px" />
          </div>
          <span
            style={{ color: avatarTextColor }}
            className={`text-xl ${defaultTextStyle} `}
          >
            {userName}
          </span>
        </div>
      </div>
    </div>
  );
};
