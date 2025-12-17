import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";
import user from "models/user.js";
import authorization from "models/authorization.js";
import { ForbiddenError } from "infra/error.js";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function findOneByUserId(userId) {
  const newToken = await runSelectQuery(userId);
  return newToken;

  async function runSelectQuery(userId) {
    const results = await database.query({
      text: `
      SELECT * FROM 
        user_activation_tokens
      WHERE 
        user_id = $1
      LIMIT 1
      `,
      values: [userId],
    });
    return results.rows[0];
  }
}
async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const result = await database.query({
      text: `
      INSERT INTO
        user_activation_tokens (user_id, expires_at)
      VALUES
        ($1, $2)
      RETURNING
        *
      `,
      values: [userId, expiresAt],
    });
    return result.rows[0];
  }
}
async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "FinTab <contato@fintab.com.br>",
    to: user.email,
    subject: "Ative seu cadastro no FinTab!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro.
${webserver.origin}/ativar/${activationToken.id}`,
  });
}

async function findOneValidById(tokenId) {
  const newToken = await runSelectQuery(tokenId);
  return newToken;

  async function runSelectQuery(tokenId) {
    const results = await database.query({
      text: `
      SELECT * FROM 
        user_activation_tokens
      WHERE 
        id = $1
        AND expires_at > NOW()
        AND used_at IS NULL
      LIMIT 1
      `,
      values: [tokenId],
    });
    return results.rows[0];
  }
}

async function markTokenAsUsed(tokenId) {
  const usedActivationToken = await runUpdateQuery(tokenId);
  return usedActivationToken;

  async function runUpdateQuery(tokenId) {
    const results = await database.query({
      text: `
      UPDATE user_activation_tokens
      SET 
        used_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
      WHERE 
        id = $1
        RETURNING 
          *
      `,
      values: [tokenId],
    });

    return results.rows[0];
  }
}

async function activateUserByUserId(userId) {
  const userToActivate = await user.findOneById(userId);
  if (!authorization.can(userToActivate, "read:activation_token")) {
    throw new ForbiddenError({
      message: "Você não pode mais utilizar tokens de ativação.",
      action: "Entre em contato com o suporte.",
    });
  }
  const activatedUser = await user.setFeatures(userId, [
    "create:session",
    "read:session",
  ]);
  return activatedUser;
}

const activation = {
  sendEmailToUser,
  create,
  findOneByUserId,
  findOneValidById,
  markTokenAsUsed,
  activateUserByUserId,
};

export default activation;
