import { useGetMe } from "../queries/profile.queries";
import { ProfileHeader } from "../blocks/ProfileHeader";
import { AccountForm } from "../forms/AccountForm";
import { PasswordForm } from "../forms/PasswordForm";
import { LoadingPlug } from "@/common/components/ui/loading-plug";

export const Profile = () => {
  const { data: user, isLoading } = useGetMe();

  if (isLoading) {
    return <LoadingPlug />;
  }

  if (!user) {
    return <div className="py-10">User not found.</div>;
  }

  return (
    <div className="flex flex-col flex-1 gap-4 lg:gap-5">
      <ProfileHeader
        firstname={user.firstname}
        lastname={user.lastname}
        email={user.email}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        <AccountForm
          firstname={user.firstname}
          lastname={user.lastname}
        />

        <PasswordForm
          email={user.email}

        />
      </div>
    </div>
  );
};