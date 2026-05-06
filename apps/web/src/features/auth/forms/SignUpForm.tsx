import { useEffect } from "react";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/common/components/ui/button";
import { FieldGroup } from "@/common/components/ui/field";
import {
  CustomField,
  PasswordField,
} from "@/common/components/ui/field-structure";
import { Input } from "@/common/components/ui/input";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerFormSchema,
  type RegisterValues,
} from "../schemas/auth.schemas";
import { Link } from "react-router-dom";
import { RoutePath } from "@/app/routes/configs/root.config";
import { useRegister } from "../queries/auth.mutations";
import { scrollTop } from "@/common/utils/scrollTop";

export const SignUpForm = () => {
  const methods = useForm<RegisterValues>({
    resolver: zodResolver(registerFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    setError,
    control,
    trigger,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  const { mutate: registerUser, isPending } = useRegister(setError);

  const password = useWatch({
    control,
    name: "password",
  });

  const confirmPassword = useWatch({
    control,
    name: "confirmPassword",
  });

  useEffect(() => {
    if (!confirmPassword) return;
    void trigger("confirmPassword");
  }, [password, confirmPassword, trigger]);

  useEffect(() => {
    if (!confirmPassword) return;
    void trigger("confirmPassword");
  }, [password, confirmPassword, trigger]);

  const onSubmit = ({
    confirmPassword: _cp,
    ...values
  }: RegisterValues) => registerUser(values);

  const isDisabled = !isValid || isPending || isSubmitting;

  return (
    <div>
      <h1 className="typo-h1 text-center lg:text-start leading-14">Sign up</h1>

      <h2 className='typo-h3 text-ui-black relative pb-2.5 w-fit mt-8 after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-green'>
        Personal Information
      </h2>

      <FormProvider {...methods}>
        <form className="mt-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="grid gap-8">
            <CustomField
              label="First name"
              required
              error={errors.firstname?.message}
            >
              <Input
                id="firstname"
                aria-invalid={!!errors.firstname}
                size="md"
                placeholder="Your first name"
                {...register("firstname")}
              />
            </CustomField>

            <CustomField
              label="Last name"
              required
              error={errors.lastname?.message}
            >
              <Input
                id="lastname"
                aria-invalid={!!errors.lastname}
                size="md"
                placeholder="Your last name"
                {...register("lastname")}
              />
            </CustomField>

            <CustomField
              label="Email"
              required
              error={errors.email?.message}
            >
              <Input
                id="email"
                aria-invalid={!!errors.email}
                size="md"
                placeholder="mail@simmmple.com"
                autoComplete="email"
                {...register("email")}
              />
            </CustomField>

            <CustomField
              label="Password"
              required
              error={errors.password?.message}
            >
              <PasswordField
                name="password"
                id="password"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                size="md"
              />
            </CustomField>

            <CustomField
              label="Confirm password"
              required
              error={errors.confirmPassword?.message}
            >
              <PasswordField
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm your password"
                autoComplete="new-password"
                size="md"
              />
            </CustomField>

            <p className="typo-secondary font-medium text-grey">
              By registering you agree to{" "}
              <Link
                to={RoutePath.TermsConditions}
                target="_blank"
                className="typo-link"
              >
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link
                to={RoutePath.PrivacyPolicy}
                target="_blank"
                className="typo-link"
              >
                Privacy Policy
              </Link>
            </p>

            <Button
              type="submit"
              disabled={isDisabled}
              variant={isDisabled ? "lightDisabled" : "default"}
            >
              {isPending ? "Loading..." : "Continue"}
            </Button>
          </FieldGroup>
        </form>
      </FormProvider>

      <p className="mt-8 typo-secondary font-medium">
        Already have an account?{" "}
        <Link
          onClick={scrollTop}
          to={RoutePath.SignIn}
          className="typo-link font-bold"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
};