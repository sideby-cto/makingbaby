import { FocusError } from "focus-formik-error";
import { useFormik } from "formik";
import { useState } from "react";
import { IoIosSend } from "react-icons/io";
import * as Yup from "yup";
import { ProIcons } from "../../../assets/icons";
import { FormSubmitButton, TextInput } from "../../../components";
import { useMutateCollections } from "../../../utils";

interface FormValues {
  email: string;
}

export const LoginPage: React.FC = () => {
  const [linkSent, setLinkSent] = useState(false);

  /**@LoginApi */
  const onLoginComplete = () => {
    setLinkSent(true);
  };
  const { mutationStates, mutations } = useMutateCollections({
    onLoginCallback: onLoginComplete,
  });
  const { loginUser } = mutations;
  const { isLoggingInUser } = mutationStates;

  /**@FormValidation   */
  const formik = useFormik<FormValues>({
    initialValues: {
      email: "",
    },
    onSubmit: async ({ email }) => {
      loginUser({ email });
    },
    validationSchema: Yup.object({}).shape({
      email: Yup.string().required("Username is required"),
    }),
  });

  const {
    handleChange,
    handleSubmit,
    values: { email },
    errors: { email: emailError },
    handleBlur,
  } = formik;

  return (
    <div className="flex flex-col h-full w-full items-center justify-center bg-[#E7EDE6]">
      <div className="border shadow drop-shadow-2xl rounded-lg bg-white p-5 flex flex-col gap-8 lg:w-1/4 md:w-1/3 w-11/12">
        {!linkSent ? (
          <>
            <div className="flex items-start flex-col font-bold justify-start gap-3">
              <div className="flex  items-center gap-2 text-[#76BA99]">
                <img
                  className="lg:w-8 lg:h-8 h-5 w-5"
                  src={ProIcons.ProLogo}
                  alt="logo"
                />
                <h4 className="text-xs uppercase">Small Wins</h4>
              </div>
              <h3 className="text-[#008080] -mt-2 lg:text-lg text-base">
                Log In to Small Wins
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <FocusError formik={formik} />
              <TextInput
                id={`=email`}
                name="email"
                label="Email"
                onChange={handleChange}
                value={email}
                errorMessage={emailError}
                onBlur={handleBlur}
              />
            </form>
            <FormSubmitButton
              onClick={handleSubmit}
              title="Log In"
              loading={isLoggingInUser}
            />
          </>
        ) : (
          <>
            <div className="flex flex-col w-full h-52 items-center justify-center space-y-3 ">
              <IoIosSend size="32px" color="black" />
              <h2 className="text-md font-interBold text-Black">
                Your magic link has been sent
              </h2>
              <p className="text-xs font-inter text-center">
                We have sent an email with a link to log into Small Wins. Tap on
                the link to be redirected to your dashboard
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
