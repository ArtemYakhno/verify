import { useEffect } from "react";
import { User } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/common/components/ui/button";
import {
  CustomField,
  InputIconField,
} from "@/common/components/ui/field-structure";
import { FieldGroup } from "@/common/components/ui/field";

import {
  updateProfileSchema,
  type UpdateProfileValues,
} from "../schemas/profile.schema";

type Props = {
  firstname: string;
  lastname: string;
  isPending: boolean;
  onSubmit: (values: UpdateProfileValues) => void;
};

export const AccountForm = ({
  firstname,
  lastname,
  isPending,
  onSubmit,
}: Props) => {
  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
    },
    mode: "onSubmit",
  });

  const {
    formState: { errors },
    handleSubmit,
    reset,
  } = form;

  useEffect(() => {
    reset({ firstname, lastname });
  }, [firstname, lastname, reset]);

  return (
    <section className="card">
      <h2 className="typo-h2 text-ui-black">Account Settings</h2>

      <p className="mt-2 typo-main text-grey">
        Here you can change your account information.
      </p>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-9">
          <FieldGroup className="gap-6">
            <CustomField
              label="First name"
              error={errors.firstname?.message}
            >
              <InputIconField
                id="firstname"
                name="firstname"
                placeholder="Enter first name"
                icon={<User className="text-placeholder size-6" />}
                align="inline-start"
              />
            </CustomField>

            <CustomField
              label="Last name"
              error={errors.lastname?.message}
            >
              <InputIconField
                id="lastname"
                name="lastname"
                placeholder="Enter last name"
                icon={<User className="text-placeholder size-6" />}
                align="inline-start"
              />
            </CustomField>

            <Button
              type="submit"
              className="w-full lg:w-[180px] lg:self-end"
              disabled={isPending}
            >
              Save changes
            </Button>
          </FieldGroup>
        </form>
      </FormProvider>
    </section>
  );
};