import user from "models/user.js";
import password from "models/password.js";
import { UnauthorizedError } from "infra/error.js";
import { NotFoundError } from "../infra/error";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  const storedUser = await finUserByEmail(providedEmail);
  await validateUserPassword(providedPassword, storedUser.password);

  return storedUser;
  async function finUserByEmail(providedEmail) {
    try {
      const storedUser = await user.findOneByEmail(providedEmail);
      return storedUser;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Dados de autenticação não conferem.",
          action: "Verifique os dados e tente novamente.",
        });
      }

      throw error;
    }
  }

  async function validateUserPassword(providedPassword, storedPassword) {
    const correctPasswordMatch = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique os dados e tente novamente.",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
