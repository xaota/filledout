import { FieldDescriptor, useField } from '@filledout/react';
import React, { ComponentType, FC } from 'react';
import { useTranslation } from 'react-i18next';

type FieldChildProps = {
  value?: any;
  error?: string;
  focused?: boolean;
  hasError?: boolean;
  onBlur?: (...args: any[]) => any | void;
  onFocus?: (...args: any[]) => any | void;
  onChange?: (...args: any[]) => any | void;
};

type FieldProps = {
  field: FieldDescriptor<any, any>;

  children:
    | React.ReactElement<FieldChildProps>
    | ((props: ReturnType<typeof useField>) => any);
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const nope = (..._: any[]) => {};

const compose =
  (g: any, f = nope) =>
  (x: any) => {
    g(x);

    f(x);
  };

const Field: FC<FieldProps> = ({ children, field: _field }) => {
  const field = useField(_field);

  const { t } = useTranslation();

  const {
    value,
    errors,
    externalErrors,
    focused,
    shouldShowValidation,
    onBlur,
    onFocus,
    onChange
  } = field;

  const error = errors?.[0] ?? externalErrors?.[0];

  if (typeof children == 'function') {
    return children(field);
  }

  return React.cloneElement(children, {
    value,
    focused,
    hasError: shouldShowValidation,
    error: error ? t(error.name, { replace: error.params }) : undefined,
    onBlur: compose(onBlur, children.props.onBlur),
    onFocus: compose(onFocus, children.props.onFocus),
    onChange: compose(onChange, children.props.onChange)
  });
};

function withField<P extends FieldChildProps>(
  Component: ComponentType<P>
): ComponentType<
  Omit<P, keyof FieldChildProps> & {
    [T in keyof FieldChildProps]?: P[T];
  }
> {
  return (({ field, ...props }: P & { field: FieldDescriptor<any, any> }) => {
    return (
      <Field field={field}>
        <Component {...(props as any)} />
      </Field>
    );
  }) as FC<
    Omit<P, keyof FieldChildProps> & {
      [T in keyof FieldChildProps]?: P[T];
    }
  >;
}

export { Field, withField };
