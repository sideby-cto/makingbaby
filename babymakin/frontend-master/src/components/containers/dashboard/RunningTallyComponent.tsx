import { FC } from "react";
import { COLORS } from "src/design-system";
import { Column, Row } from "src/components/shared";



interface RunningTallyComponentProps {
  visible?: boolean;
  stories?: any[];
  uniqueAuthors?: string[];
}

export const RunningTallyComponent: FC<RunningTallyComponentProps> = ({
  visible = false,
  stories = [],
  uniqueAuthors = []
}) => {
  if (visible === false) return null;

  const numberOfUniqueUsers = uniqueAuthors.length;
  const numberOfStories = stories.length;
  
  let smallWinText = (numberOfStories === 1) ? 'Small Win in your Search' : 'Small Wins in your Search';
  let uniqueUserText = (numberOfUniqueUsers === 1) ? 'Contributor' : 'Contributors';

  return (
    <div>
      <Row>
      <Column className="items-center mt-5 p-2 w-fit bg-white rounded-lg drop-shadow-lg">
          <h2 className="text-sm lg:text-md font-interBold text-defaultText tracking-wider">
            <span
              style={{ color: COLORS.getStarted.iconColor }}
              className="text-logoGreen text-2xl lg:text-3xl px-2"
            >
              {numberOfStories}
            </span>
            {smallWinText}
          </h2>
      </Column>

      <Column className="items-center mt-5 mx-2 p-2 w-fit bg-white rounded-lg drop-shadow-lg">
        <h2 className="text-sm lg:text-md font-interBold text-defaultText tracking-wider">
          <span
              style={{ color: COLORS.getStarted.iconColor }}
              className="text-logoGreen text-2xl lg:text-3xl px-2"
            >
              {numberOfUniqueUsers}
            </span>
            {uniqueUserText}
          </h2>
      </Column>
      </Row>
    </div>
  );
};
