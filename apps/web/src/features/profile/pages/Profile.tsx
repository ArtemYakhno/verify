import { useGetMe } from "../queries/profile.queries";
import {
  useChangePassword,
  useUpdateProfile,
} from "../queries/profile.mutations";

import { profileKeys } from "../queries/profile.keys";
import { ProfileHeader } from "../blocks/ProfileHeader";
import { AccountForm } from "../forms/AccountForm";
import { PasswordForm } from "../forms/PasswordForm";
import type { ChangePasswordDto, UpdateProfileValues } from "../schemas/profile.schema";
import type { Modal } from "@/common/types/Modal";
import { useState } from "react";
import { SuccessModal } from "@/app/modals/SuccessModal";
import { useQueryClient } from "@tanstack/react-query";



export const Profile = () => {
  const { data: user, isLoading } = useGetMe();

  const { mutate: updateProfile, isPending: isUpdatePending } =
    useUpdateProfile();

  const { mutateAsync: changePassword, isPending: isPasswordPending } =
    useChangePassword();

  const [successModal, setSuccessModal] = useState<Modal>({
    isOpen: false,
  });

  const queryClient = useQueryClient();

  const openSuccessModal = () => {
    setSuccessModal((prev) => ({
      ...prev,
      isOpen: true,
    }));
  };

  const closeSuccessModal = () => {
    setSuccessModal((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  if (isLoading) {
    return <div className="py-10">Loading...</div>;
  }

  if (!user) {
    return <div className="py-10">User not found.</div>;
  }

  const handleUpdateProfile = (values: UpdateProfileValues) => {
    updateProfile(values, {
      onSuccess: (updatedUser) => {
        queryClient.setQueryData(profileKeys.me(), updatedUser);

        openSuccessModal();
      },
    });
  };

  const handleChangePassword = async (values: ChangePasswordDto) => {
    await changePassword(values, {
      onSuccess: () => {
        openSuccessModal();
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <ProfileHeader
        firstname={user.firstname}
        lastname={user.lastname}
        email={user.email}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        <AccountForm
          firstname={user.firstname}
          lastname={user.lastname}
          isPending={isUpdatePending}
          onSubmit={handleUpdateProfile}
        />

        <PasswordForm
          email={user.email}
          isPending={isPasswordPending}
          onSubmit={handleChangePassword}
        />
      </div>
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={closeSuccessModal}
        title={successModal.title}
        description={successModal.description}
      />
    </div>
  );
};