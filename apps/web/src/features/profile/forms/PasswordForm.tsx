import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/common/components/ui/button";
import {
  CustomField,
  PasswordField,
} from "@/common/components/ui/field-structure";
import { FieldGroup } from "@/common/components/ui/field";

import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "../schemas/profile.schema";
import { PasswordChecklist } from "@/common/components/blocks/PasswordChecklist";
import { openSuccessModal } from "@/common/stores/success-modal.store";
import { useChangePassword } from "../queries/profile.mutations";
import { toast } from "sonner";

type Props = {
  email: string;
};

export const PasswordForm = ({ email }: Props) => {
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });


  const { mutateAsync: changePassword, isPending } =
    useChangePassword();

  const {
    formState: { errors, isDirty },
    handleSubmit,
    control,
    reset,
  } = form;

  const newPassword = useWatch({
    control,
    name: "newPassword",
  });

  const confirmPassword = useWatch({
    control,
    name: "confirmPassword",
  });

  const submitHandler = async (values: ChangePasswordValues) => {
    if (!isDirty) {
      toast.warning('There are no changes')
      return;
    }

    try {
      const { confirmPassword: _cp, ...rest } = values;
      await changePassword(rest);
      reset();
      openSuccessModal()
    }
    catch {
      return;
    }
  };


  return (
    <section className="card">
      <h2 className="typo-h2 text-ui-black">Change Password</h2>

      <p className="mt-2 typo-main text-grey">
        Here you can set your new password.
      </p>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(submitHandler)} className="mt-9">
          <input
            type="text"
            autoComplete="username"
            value={email}
            readOnly
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
          />

          <FieldGroup className="gap-6">
            <CustomField
              label="Old password"
              error={errors.currentPassword?.message}
            >
              <PasswordField
                id="currentPassword"
                name="currentPassword"
                placeholder="********"
                autoComplete="current-password"
              />
            </CustomField>

            <CustomField
              label="New password"
              error={errors.newPassword?.message}
            >
              <PasswordField
                id="newPassword"
                name="newPassword"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
              />
            </CustomField>

            <CustomField
              label="New password confirmation"
              error={errors.confirmPassword?.message}
            >
              <PasswordField
                id="confirmPassword"
                name="confirmPassword"
                placeholder="New password confirmation"
                autoComplete="new-password"
              />
            </CustomField>

            {newPassword.length > 0 && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <PasswordChecklist
                  password={newPassword}
                  confirmPassword={confirmPassword}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full lg:w-[180px] lg:self-end"
              disabled={isPending}
            >
              Change password
            </Button>
          </FieldGroup>
        </form>
      </FormProvider>
    </section>
  );
};