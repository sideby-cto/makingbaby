import { useMutation } from "@tanstack/react-query";
import { Mutations } from "../../api";
import {
  CreateMutationConfiguration,
  _CreateMutationConfiguration,
} from "../functions";

type MutateCollectionArgs = {
  /// Create
  onCreateStoryCallback?: Function;
  onCreateUserCallback?: Function;
  /// Update
  onUpdateUserUserCallback?: Function;
  // Delete
  onDeleteDataCallback?: Function;
  // Auth
  onLoginCallback?: Function;
};

type MutationConfig = {
  successCallback: Function;
  successMessage?: string;
  errorCallback?: Function;
  errorMessage?: string;
  mutation: keyof typeof Mutations;
};

export const _useMutateCollections = (config: MutationConfig) => {
  const mutationConfig = _CreateMutationConfiguration(
    config?.successCallback,
    config?.errorCallback,
    config?.errorMessage,
    config?.successMessage
  );
  const mutationFunction = Mutations[config.mutation] as any;
  const {
    mutateAsync: handler,
    isPending,
    isSuccess,
    isError,
  } = useMutation({ mutationFn: mutationFunction, ...mutationConfig });
  return {
    handler,
    isPending,
    mutationSuccess: isSuccess,
    mutationError: isError,
  };
};

export const useMutateCollections = (args: MutateCollectionArgs) => {
  //// IMPLEMENT OPEN-CLOSE
  /**@MutationConfigs */
  const createStoryConfig = CreateMutationConfiguration(
    args?.onCreateStoryCallback
  );
  const createUsersConfig = CreateMutationConfiguration(
    args?.onCreateUserCallback
  );
  const updateUserConfig = CreateMutationConfiguration(
    args?.onUpdateUserUserCallback
  );
  const deleteUserConfig = CreateMutationConfiguration(
    args?.onDeleteDataCallback
  );
  const loginCallBackConfig = CreateMutationConfiguration(
    args?.onLoginCallback
  );

  /**
   *
   * @Mutations
   *
   *  */
  // Creates
  const { mutateAsync: createStoryFunction, isPending: isCreatingStory } =
    useMutation({ mutationFn: Mutations.createStory, ...createStoryConfig });
  const { mutateAsync: createUserFunction, isPending: isCreatingUser } =
    useMutation({ mutationFn: Mutations.createUser, ...createUsersConfig });
  // -> Updates
  const { mutateAsync: updateUserFunction, isPending: isUpdatingUser } =
    useMutation({ mutationFn: Mutations.updateUser, ...updateUserConfig });
  // -> Delete
  const { mutateAsync: deleteDataFunction, isPending: isDeletingData } =
    useMutation({ mutationFn: Mutations.deleteData, ...deleteUserConfig });
  // -> Auth
  const { mutateAsync: loginUser, isPending: isLoggingInUser } = useMutation({
    mutationFn: Mutations.loginUser,
    ...loginCallBackConfig,
  });

  return {
    mutations: {
      createStoryFunction,
      createUserFunction,
      updateUserFunction,
      deleteDataFunction,
      loginUser,
    },
    mutationStates: {
      isCreatingStory,
      isCreatingUser,
      isUpdatingUser,
      isDeletingData,
      isLoggingInUser,
    },
  };
};
