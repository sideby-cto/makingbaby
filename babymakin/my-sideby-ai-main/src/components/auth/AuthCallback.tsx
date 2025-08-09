
import { AuthCallbackProcessor } from "./callback/AuthCallbackProcessor";

// Using named export for component
export const AuthCallback = () => {
  return <AuthCallbackProcessor />;
};

// Add default export to make it compatible with React.lazy
export default AuthCallback;
