import { UserAvatar } from "@/common/components/ui/user-avatar";

type Props = {
  firstname: string;
  lastname: string;
  email: string;
};

export const ProfileHeader = ({ firstname, lastname, email }: Props) => {
  return (
    <section className="card">
      <div className="relative">
        <div
          className="h-[120px] w-full rounded-md bg-[url('/images/profile-bg.webp')] bg-cover bg-center bg-no-repeat lg:h-[160px]"
        />

        <div className="absolute left-1/2 top-full z-10 -translate-x-1/2 -translate-y-1/2">
          <UserAvatar
            name={`${firstname} ${lastname}`}
            className="size-22.5 border-4 border-nature-white text-[32px] font-bold"
          />
        </div>
      </div>

      <div className="flex flex-col items-center pt-14 lg:pt-10">
        <h2 className="text-center typo-h2 text-ui-black">
          {firstname} {lastname}
        </h2>

        <p className="mt-1 text-center typo-main text-grey">{email}</p>
      </div>
    </section>
  );
};