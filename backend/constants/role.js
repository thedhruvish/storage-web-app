export const ROLE = ["owner", "admin", "manager", "user"];
export const PERMISSION_ROLE = ["owner", "manager", "editor", "viewer"];

// export const role = {
//   owner: ["read", "write", "update", "delete"],
//   manager: ["read", "write", "update"],
//   editor: ["read", "write"],
//   viewer: ["read"],
// };

export const roleWeights = {
  owner: 100,
  manager: 80,
  editor: 60,
  viewer: 30,
};

export const actionRights = {
  read: roleWeights.viewer, // 100 >= 30
  write: roleWeights.editor, // not delete 30 >=60
  update: roleWeights.manager, // all permision execpt share
  delete: roleWeights.owner, // delete to down
};
