import { Eye, EyeOff } from 'lucide-react';
import { useController, useFormContext } from 'react-hook-form';
import { Input, type InputProps } from './input';

import { useState, type ReactNode } from 'react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './input-group';
import { Field, FieldLabel, FieldMessage } from './field';

interface INormalizedInputFieldProps extends InputProps {
  name: string;
  normalize?: (value: string) => string;
}

export const NormalizedInputField = ({
  name,
  id,
  normalize,
  ...inputProps
}: INormalizedInputFieldProps) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });

  return (
    <Input
      {...inputProps}
      {...field}
      id={id ?? name}
      onChange={(e) => field.onChange(normalize ? normalize(e.target.value) : e.target.value)}
      aria-invalid={!!fieldState.error}
    />
  );
};



interface IPasswordFieldProps extends InputProps {
  name: string;
}

export const PasswordField = ({
  name,
  id,
  placeholder = 'Enter password',
  size,
  ...props
}: IPasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { control } = useFormContext();
  const { field, fieldState } = useController({ control, name });

  return (
    <InputGroup>
      <InputGroupInput
        {...field}
        {...props}
        id={id ?? name}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        aria-invalid={!!fieldState.error}
        size={size}
      />
      <InputGroupAddon align='inline-end'>
        <InputGroupButton
          type='button'
          aria-label='toggle password'
          onClick={() => setShowPassword((p) => !p)}
        >
          {showPassword ? <EyeOff className='text-placeholder size-6' />
            : <Eye className='text-placeholder size-6' />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};


interface CustomFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean
  error?: string;
  children: ReactNode;
}

export const CustomField = ({
  label,
  htmlFor,
  required,
  optional,
  error,
  children,
}: CustomFieldProps) => {
  return (
    <Field>
      <FieldLabel htmlFor={htmlFor} className="typo-secondary">
        {label} {required && <span className="text-red">*</span>} {optional && <span className='typo-main text-[14px]'>(optional)</span>}
      </FieldLabel>

      {children}

      <FieldMessage message={error} />
    </Field>
  );
};


interface IInputIconFieldProps extends InputProps {
  name: string;
  icon?: ReactNode;
  align?: 'inline-start' | 'inline-end';
}

export const InputIconField = ({
  name,
  id,
  placeholder,
  size,
  icon,
  align = 'inline-start',
  ...props
}: IInputIconFieldProps) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ control, name });

  return (
    <InputGroup>
      {align === 'inline-start' && icon ? (
        <InputGroupAddon align='inline-start'>
          <div
            aria-hidden='true'
            className='pointer-events-none flex items-center justify-center'
          >
            {icon}
          </div>
        </InputGroupAddon>
      ) : null}

      <InputGroupInput
        {...field}
        {...props}
        id={id ?? name}
        placeholder={placeholder}
        aria-invalid={!!fieldState.error}
        size={size}
      />

      {align === 'inline-end' && icon ? (
        <InputGroupAddon align='inline-end'>
          <div
            aria-hidden='true'
            className='pointer-events-none flex items-center justify-center'
          >
            {icon}
          </div>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
};