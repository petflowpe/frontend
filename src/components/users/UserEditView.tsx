import { UserFormView, type UserFormViewProps } from './UserFormView';
import type { User } from './types';

type Props = Omit<UserFormViewProps, 'mode' | 'editingUser'> & { editingUser: User };

export function UserEditView({ editingUser, ...rest }: Props) {
  return <UserFormView {...rest} mode="edit" editingUser={editingUser} />;
}
