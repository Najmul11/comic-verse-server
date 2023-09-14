import { IUser } from './user.interface';
import { User } from './user.model';

const createUser = async (user: IUser): Promise<IUser | null> => {
  const result = await User.create(user);

  const sanitizedResult = await User.findById(result._id)
    .select('-password')
    .lean();

  return sanitizedResult;
};

export const UserService = {
  createUser,
};
