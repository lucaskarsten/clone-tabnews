exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    // Limite de 30 caracteres para manter o username legível em URLs.
    username: {
      type: "varchar(30)",
      notNull: true,
      unique: true,
    },
    // 254 é o tamanho máximo de um endereço de email válido (RFC 5321).
    email: {
      type: "varchar(254)",
      notNull: true,
      unique: true,
    },
    // bcrypt gera hashes de exatamente 60 caracteres.
    password: {
      type: "varchar(60)",
      notNull: true,
    },
    features: {
      type: "varchar[]",
      notNull: true,
      default: "{}",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
  });
};

exports.down = false;
