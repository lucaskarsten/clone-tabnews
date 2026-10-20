const ANONYMOUS_FEATURES = [
  "read:activation_token",
  "create:session",
  "create:user",
];

function can(user, feature, resource) {
  let authorized = user.features.includes(feature);

  // Sem super feature, só se pode alterar o próprio usuário.
  if (authorized && feature === "update:user" && resource) {
    authorized =
      user.id === resource.id || user.features.includes("update:user:others");
  }

  return authorized;
}

function pick(object, keys) {
  return Object.fromEntries(keys.map((key) => [key, object[key]]));
}

const USER_PUBLIC_FIELDS = [
  "id",
  "username",
  "features",
  "created_at",
  "updated_at",
];

function filterOutput(user, feature, resource) {
  if (feature === "read:user") {
    const fields =
      user.id && user.id === resource.id
        ? [...USER_PUBLIC_FIELDS, "email"]
        : USER_PUBLIC_FIELDS;
    return pick(resource, fields);
  }

  if (feature === "read:session") {
    return pick(resource, [
      "id",
      "token",
      "user_id",
      "expires_at",
      "created_at",
      "updated_at",
    ]);
  }

  if (feature === "read:activation_token") {
    return pick(resource, [
      "id",
      "user_id",
      "used_at",
      "expires_at",
      "created_at",
      "updated_at",
    ]);
  }

  if (feature === "read:status") {
    const output = {
      updated_at: resource.updated_at,
      dependencies: {
        database: pick(resource.dependencies.database, [
          "max_connections",
          "open_connection",
        ]),
      },
    };
    if (can(user, "read:status:all")) {
      output.dependencies.database.version =
        resource.dependencies.database.version;
    }
    return output;
  }

  throw new TypeError(`Feature "${feature}" sem filtro de saída.`);
}

const authorization = {
  ANONYMOUS_FEATURES,
  can,
  filterOutput,
};

export default authorization;
