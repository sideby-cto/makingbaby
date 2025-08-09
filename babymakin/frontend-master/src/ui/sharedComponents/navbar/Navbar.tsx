import React, { useCallback, useState } from "react";
import { SiGoogleanalytics } from "react-icons/si";
import { FaUsers, FaUsersCog, FaLink } from "react-icons/fa";
import { CgLogOut } from "react-icons/cg";
import { VscSettings } from "react-icons/vsc";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineComment } from "react-icons/ai";
import { NavbarAvatarContainer } from "../../../components";
import { useUserGlobalState } from "../../../hooks/useUserGlobalState";
import { IoIosBook, IoMdHelpCircle } from "react-icons/io";
import {
  navBarStyle,
  defaultTabStyle,
  activeTabTextStyle,
  inactiveTabTextStyle,
  activeTabColor,
  inactiveTabColor,
  LOGOUT_ICON_SIZE,
  ICON_SIZE,
} from "./navBarUtils";
import { BsFillBookmarkFill } from "react-icons/bs";
import { FaMagnifyingGlassChart } from "react-icons/fa6";
import { ClearLocalStorage } from "../../../utils";
import { EventNames, MixPanel } from "../../../utils/mixPanel";

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [navbarOpened, setNavbarState] = useState(false);
  const user = useUserGlobalState()[0];
  const location = useLocation();
  const currentTab = location.pathname;

  const logoutHandler = () => {
    ClearLocalStorage("userToken");
    ClearLocalStorage("user-data");
    MixPanel.track(EventNames.userLoggedOut);
    window.location.reload();
  };

  const renderTabTextStyle = useCallback(
    (tab: string) => {
      if (tab === currentTab) return activeTabTextStyle;
      return inactiveTabTextStyle;
    },
    [currentTab]
  );
  const renderActiveTabIconColor = useCallback(
    (tab: string) => {
      if (tab === currentTab) return activeTabColor;
      return inactiveTabColor;
    },
    [currentTab]
  );

  const onMobileClick = (path: string) => {
    navigate(path);
    setNavbarState(!navbarOpened);
  };

  const isAdmin = user?.permissionLevel === "Admin";

  return (
    <>
      <div
        style={navBarStyle}
        className="hidden lg:block relative z-20 w-[240px] px-4"
      >
        <div className="pt-3 pb-8 lg:pb-16">
          <NavbarAvatarContainer />
        </div>
        <div className="space-y-4 mt-8 lg:mt-0">
          <Link className={defaultTabStyle} to="/dashboard">
            <SiGoogleanalytics
              size={ICON_SIZE}
              color={renderActiveTabIconColor("/dashboard")}
            />
            <span className={renderTabTextStyle("/dashboard")}>Dashboard</span>
          </Link>
          <Link className={defaultTabStyle} to="/dashboard/insights">
            <FaMagnifyingGlassChart
              size={ICON_SIZE}
              color={renderActiveTabIconColor("/dashboard/insights")}
            />
            <span className={renderTabTextStyle("/dashboard/insights")}>
              Insights
            </span>
          </Link>
          <Link className={defaultTabStyle} to="/dashboard/my-stories">
            <BsFillBookmarkFill
              color={renderActiveTabIconColor("/dashboard/my-stories")}
              size="1.3rem"
            />
            <span className={renderTabTextStyle("/dashboard/my-stories")}>
              My Stories
            </span>
          </Link>
          {isAdmin ? (
            <>
              <Link to="/data-bank" className={defaultTabStyle}>
                <VscSettings
                  color={renderActiveTabIconColor("/data-bank")}
                  size={ICON_SIZE}
                />
                <span className={renderTabTextStyle("/data-bank")}>Bank</span>
              </Link>
              <Link to="/teams" className={defaultTabStyle}>
                <FaUsers
                  color={renderActiveTabIconColor("/teams")}
                  size={ICON_SIZE}
                />
                <span className={renderTabTextStyle("/teams")}>Teams</span>
              </Link>
              <Link className={defaultTabStyle} to="/users">
                <FaUsersCog
                  color={renderActiveTabIconColor("/users")}
                  size={ICON_SIZE}
                />
                <span className={renderTabTextStyle("/users")}>Users</span>
              </Link>
              <div className={`${defaultTabStyle} mt-5`}>
                <a
                  href="https://sites.google.com/smallwinsdashboard.com/swd-resources/home"
                  target="_blank"
                  className={renderTabTextStyle("/resources")}
                  rel="noreferrer"
                >
                  <IoIosBook color={inactiveTabColor} size={ICON_SIZE} />
                  <span className="px-6">Resources</span>
                </a>
              </div>
              <div className={`${defaultTabStyle} mt-5 cursor-not-allowed opacity-50`}>
                <FaLink color={inactiveTabColor} size={ICON_SIZE} />
                <span className="px-6">Connect your sideby account (coming soon)</span>
              </div>
            </>
          ) : (
            <div className="mt-12">
              <span className="text-md font-interBold">Actions</span>
              <Link className={`${defaultTabStyle} mt-5`} to="/create-story">
                <AiOutlineComment
                  color={renderActiveTabIconColor("/create-story")}
                  size={ICON_SIZE}
                />
                <span className={renderTabTextStyle("/create-story")}>
                  Create a Story
                </span>
              </Link>
              <div className={`${defaultTabStyle} mt-5`}>
                <a
                  href="https://sites.google.com/smallwinsdashboard.com/swd-resources/home"
                  target="_blank"
                  className={renderTabTextStyle("/resources")}
                  rel="noreferrer"
                >
                  <IoIosBook color={inactiveTabColor} size={ICON_SIZE} />
                  <span className="px-6">Resources</span>
                </a>
              </div>
              <div className={`${defaultTabStyle} mt-5 cursor-not-allowed opacity-50`}>
                <FaLink color={inactiveTabColor} size={ICON_SIZE} />
                <span className="px-6">Connect your sideby account (coming soon)</span>
              </div>
              <div className={`${defaultTabStyle} mt-5`}>
                <a
                  href="mailto:admin@smallwinsdashboard.com"
                  className={renderTabTextStyle("/contact-us")}
                >
                  <IoMdHelpCircle color={inactiveTabColor} size={ICON_SIZE} />
                  <span className="px-6">Contact Us</span>
                </a>
              </div>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 pb-6">
          <div onClick={logoutHandler} className={defaultTabStyle}>
            <CgLogOut size={LOGOUT_ICON_SIZE} color={inactiveTabColor} />
            <span className={renderTabTextStyle("/logout")}>Log out</span>
          </div>
        </div>
      </div>
      <div
        style={navBarStyle}
        className={`block lg:hidden absolute z-20 flex flex-col w-full ${
          navbarOpened ? "h-full" : "h-20 bg-white drop-shadow-xl"
        } transition-[height] duration-500 ease-in-out pl-6 pr-4 overflow-hidden`}
      >
        <div className="pt-3 pb-8 lg:pb-16">
          <NavbarAvatarContainer
            toggleNavbarState={() => setNavbarState(!navbarOpened)}
          />
        </div>
        <div className="flex flex-col space-y-8 mt-8 lg:mt-0">
          <div
            className={defaultTabStyle}
            onClick={() => onMobileClick("/dashboard")}
          >
            <SiGoogleanalytics
              size={ICON_SIZE}
              color={renderActiveTabIconColor("/dashboard")}
            />
            <span className={renderTabTextStyle("/dashboard")}>Dashboard</span>
          </div>
          <div
            className={defaultTabStyle}
            onClick={() => onMobileClick("/dashboard/insights")}
          >
            <FaMagnifyingGlassChart
              size="1.3rem"
              color={renderActiveTabIconColor("/dashboard/insights")}
            />

            <span className={renderTabTextStyle("/dashboard/insights")}>
              Insights
            </span>
          </div>
          <div
            className={defaultTabStyle}
            onClick={() => onMobileClick("/dashboard/my-stories")}
          >
            <BsFillBookmarkFill
              color={renderActiveTabIconColor("/dashboard/my-stories")}
              size="1.3rem"
            />
            <span className={renderTabTextStyle("/dashboard/my-stories")}>
              My Stories
            </span>
          </div>
          {isAdmin ? (
            <>
              <div
                onClick={() => onMobileClick("/data-bank")}
                className={defaultTabStyle}
              >
                <VscSettings
                  color={renderActiveTabIconColor("/data-bank")}
                  size={ICON_SIZE}
                />
                <span className={renderTabTextStyle("/data-bank")}>Bank</span>
              </div>
              <div
                onClick={() => onMobileClick("/teams")}
                className={defaultTabStyle}
              >
                <FaUsers
                  color={renderActiveTabIconColor("/teams")}
                  size={ICON_SIZE}
                />
                <span className={renderTabTextStyle("/teams")}>Teams</span>
              </div>
              <div
                onClick={() => onMobileClick("/users")}
                className={defaultTabStyle}
              >
                <FaUsersCog
                  color={renderActiveTabIconColor("/users")}
                  size={ICON_SIZE}
                />
                <span className={renderTabTextStyle("/users")}>Users</span>
              </div>
              <div className={`${defaultTabStyle} mt-5`}>
                <a
                  href="https://sites.google.com/smallwinsdashboard.com/swd-resources/home"
                  target="_blank"
                  className={renderTabTextStyle("/resources")}
                  rel="noreferrer"
                >
                  <IoIosBook color={inactiveTabColor} size={ICON_SIZE} />
                  <span className="px-6">Resources</span>
                </a>
              </div>
              <div className={`${defaultTabStyle} mt-5 cursor-not-allowed opacity-50`}>
                <FaLink color={inactiveTabColor} size={ICON_SIZE} />
                <span className="px-6">Connect your sideby account (coming soon)</span>
              </div>
            </>
          ) : (
            <div className="mt-12">
              <span className="text-md font-interBold">Actions</span>
              <div
                className={`${defaultTabStyle} mt-5`}
                onClick={() => onMobileClick("/create-story")}
              >
                <AiOutlineComment
                  color={renderActiveTabIconColor("/create-story")}
                  size={ICON_SIZE}
                />
                <span className={renderTabTextStyle("/create-story")}>
                  Create a Story
                </span>
              </div>
              <div className={`${defaultTabStyle} mt-5`}>
                <a
                  href="https://sites.google.com/smallwinsdashboard.com/swd-resources/home"
                  target="_blank"
                  className={renderTabTextStyle("/resources")}
                  rel="noreferrer"
                >
                  <IoIosBook color={inactiveTabColor} size={ICON_SIZE} />
                  <span className="px-6">Resources</span>
                </a>
              </div>
              <div className={`${defaultTabStyle} mt-5 cursor-not-allowed opacity-50`}>
                <FaLink color={inactiveTabColor} size={ICON_SIZE} />
                <span className="px-6">Connect your sideby account (coming soon)</span>
              </div>
              <div className={`${defaultTabStyle} mt-5`}>
                <a
                  href="mailto:admin@smallwinsdashboard.com"
                  className={renderTabTextStyle("/contact-us")}
                >
                  <IoMdHelpCircle color={inactiveTabColor} size={ICON_SIZE} />
                  <span className="px-6">Contact Us</span>
                </a>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col w-full h-full justify-end pb-12">
          <div onClick={logoutHandler} className={defaultTabStyle}>
            <CgLogOut size={LOGOUT_ICON_SIZE} color={inactiveTabColor} />
            <span className={renderTabTextStyle("/logout")}>Log out</span>
          </div>
        </div>
      </div>
    </>
  );
};
