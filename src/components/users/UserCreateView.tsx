import { UserFormView, type UserFormViewProps } from './UserFormView';

type Props = Omit<UserFormViewProps, 'mode' | 'editingUser'>;

export function UserCreateView(props: Props) {
  return <UserFormView {...props} mode="create" editingUser={null} />;
}
