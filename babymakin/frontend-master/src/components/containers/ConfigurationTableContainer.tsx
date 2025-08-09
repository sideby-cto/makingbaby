import React, { useState } from "react";
import { BiPlus } from "react-icons/bi";
import { IoMdCloseCircle } from "react-icons/io";
import { MdOutlineTableRows } from "react-icons/md";
import { ConfigurationNamesType } from "../../utils/types";
import { ConfigurationTableRow } from "./ConfigurationTableRow";
import { Loading, H2, IconButton } from "src/components";

interface DataItem {
  // define type of 'name' property in object for search query
  name: string; 
}

interface ConfigurationTableContainerProps {
  createNewRowHandler: () => void;
  onRowClick: (data: any) => void;
  onDeleteClick: (data: any) => void;
  data: DataItem[];
  name: ConfigurationNamesType;
  tableProps?: {
    width: string;
    isSmall?: boolean;
  };
  isLoading: boolean;
}

export const ConfigurationTableContainer: React.FC<
  ConfigurationTableContainerProps
> = ({
  createNewRowHandler,
  onRowClick,
  onDeleteClick,
  data,
  name,
  isLoading,
  tableProps,
}) => {
  /** @Handlers */

  /** @Styles */
  const textStyle = "font-inter text-[12px] text-[#00000070]";

  /** @Vars */
  let buttonTitle =
    name === "Goals"
      ? "New Goal"
      : name === "Promising Practices"
      ? "New Promising Practice"
      : name === "Organizations"
      ? "New Organization"
      : name === "Districts"
      ? "New District"
      : name === "Schools"
      ? "New School"
      : name === "School Classifications"
      ? "New School Classification"
      : name === "Teams"
      ? "New Team"
      : name === "Student Characteristics"
      ? "New Student Characteristic"
      : "New Success Sign";
  const isSmall = tableProps?.isSmall ?? false;

  // State for the search query
  const [searchQuery, setSearchQuery] = useState("");

  // Function to handle search input changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  // Filter data based on the search query
  const filteredData = searchQuery ? data.filter(
    (item: DataItem) => item.name.toLowerCase().includes(searchQuery)) : data;

  // Reset search query state
  const clearSearch = () => setSearchQuery("");

  /** @RenderFns */
  const renderTableRows = () => {
    if (filteredData.length > 0) {
      return filteredData.map((rowData, idx) => (
        <ConfigurationTableRow
          data={rowData}
          parent={name}
          onDeleteClick={() => onDeleteClick({ rowData, listTitle: name })}
          onRowClick={() => onRowClick(rowData)}
          key={idx}
          rowType={isSmall ? "small" : "wide"}
        />
      ));
    }
    return (
      <div className="flex flex-col space-y-3 py-4 w-full h-full justify-center items-center">
        <MdOutlineTableRows color="#000" size="20px" />
        <p className="text-sm font-interBold text-black">
          {name} collection is empty
        </p>
      </div>
    );
  };

  const tableHeader = isSmall ? (
    <div className={`w-3/5 ${textStyle}`}>Name</div>
  ) : name === "Teams" ? (
    <>
      <div className={`w-2/5 ${textStyle}`}>Name</div>
      <div className={`w-1/5 ${textStyle}`}>School</div>
    </>
  ) : name === "Schools" ? (
    <>
      <div className={`w-2/5 ${textStyle}`}>Name</div>
      <div className={`w-1/5 ${textStyle}`}>District</div>
    </>
  ) : name === "Districts" ? (
    <>
      <div className={`w-2/5 ${textStyle}`}>Name</div>
      <div className={`w-1/5 ${textStyle}`}>Organization</div>
    </>
  ) : name === "Organizations" || name === "School Classifications" ? (
    <>
      <div className={`w-2/5 ${textStyle}`}>Name</div>
    </>
  ) : null;

  /**@renderFn */
  return (
    <div
      style={{ width: tableProps?.width }}
      className="flex flex-col space-y-2"
    >
      <div className="flex justify-between items-center">
        <H2 heading={name} />
        <IconButton
          Icon={BiPlus}
          iconProps={{ color: "#fff", size: "1.25rem" }}
          textStyle="text-[15px] font-inter text-white"
          containerStyle="flex space-x-2 rounded-full bg-[#008080] px-4 py-2
            hover:bg-[#036b6b] transistion-all duration-200"
          title={buttonTitle}
          onClick={createNewRowHandler}
        />
      </div>

      {/* Search Row with Clear Button */}
      <div className="relative flex items-center border border-gray-300 rounded-lg">
        {/* Search Input */}
        <input
          type="text"
          placeholder={`Search ${name}`}
          value={searchQuery}
          onChange={handleSearchChange}
          className="p-2 px-3 flex-grow bg-transparent focus:outline-none"
        />

        {/* Clear Search Button */}
        <button
          onClick={clearSearch}
          className="absolute right-3 text-gray-500 hover:text-gray-900"
        >
          <IoMdCloseCircle size="1.25em" />
        </button>
      </div>

      {/* Scrolling Table */}
      <div className="rounded-[12px] border-[0.5px] bg-white border-[#00000030]">
        <div className="pt-4 pb-3 flex font-semibold border-b-[0.5px] text-sm text-[#00000080] bg-[#D9D9D933] 2xl:text-lg px-4">
          {tableHeader}
        </div>
        <div
          className={`flex flex-col pb-2 overflow-y-auto ${
            isSmall ? "h-44" : "h-64"
          } `}
        >
          {isLoading ? (
            <div className="flex flex-col space-y-3 py-4 w-full h-full justify-center items-center">
              <Loading />
            </div>
          ) : (
            renderTableRows()
          )}
        </div>
      </div>
    </div>
  );
};
