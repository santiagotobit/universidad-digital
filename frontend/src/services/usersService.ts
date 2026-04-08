import * as usersApi from "../api/users";

export const usersService = {
  list: usersApi.listUsers,
  create: usersApi.createUser,
  update: usersApi.updateUser,
  deactivate: usersApi.deactivateUser
};
