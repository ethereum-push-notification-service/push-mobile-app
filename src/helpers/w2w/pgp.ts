import OpenPGP from 'react-native-fast-openpgp';
import CryptoHelper from 'src/helpers/CryptoHelper';

export const generateKeyPair = async (): Promise<{
  privateKeyArmored: string;
  publicKeyArmored: string;
}> => {
  const keys = await OpenPGP.generate({
    name: '',
    email: '',
    keyOptions: {
      rsaBits: 2048,
    },
  });

  let publicKey = keys.publicKey;

  // remove version info from pgp
  publicKey = publicKey.replace(/^Version:.*\n/m, '');

  return {
    privateKeyArmored: keys.privateKey,
    publicKeyArmored: publicKey,
  };
};

export const pgpDecrypt = async (_cipher: string, privateKey: string) => {
  const output = await OpenPGP.decrypt(_cipher, privateKey, '');
  return output;
};

// Encrypt with multiple keys
const concatPublicKeys = (senderAddress: string, receiverAddress: string) => {
  return `${receiverAddress}\n${senderAddress}`;
};

export const encryptAndSign = async ({
  plainText,
  fromPublicKeyArmored,
  toPublicKeyArmored,
  privateKeyArmored,
}: {
  plainText: string;
  fromPublicKeyArmored: string;
  toPublicKeyArmored: string;
  privateKeyArmored: string;
}): Promise<{
  cipherText: string;
  encryptedSecret: string;
  signature: string;
  sigType: string;
  encType: string;
}> => {
  const secretKey: string = CryptoHelper.generateRandomSecret(15);
  const cipherText: string = CryptoHelper.encryptWithAES(plainText, secretKey);
  let encryptedSecret = await OpenPGP.encrypt(
    secretKey,
    concatPublicKeys(fromPublicKeyArmored, toPublicKeyArmored),
  );
  let signature: string = await OpenPGP.sign(
    cipherText,
    fromPublicKeyArmored,
    privateKeyArmored,
    '',
  );

  // Removing metadata from signature and encryptedSecret
  signature = signature.replace('\nVersion: openpgp-mobile', '');
  encryptedSecret = encryptedSecret.replace('\nVersion: openpgp-mobile', '');
  return {
    cipherText,
    encryptedSecret, // enc AES key here
    signature,
    sigType: 'pgp',
    encType: 'pgp',
  };
};

export const pgpSign = async (plainText: string, privateKeyArmored: string) => {
  const signature: string = await OpenPGP.sign(
    plainText,
    privateKeyArmored,
    '',
  );

  return signature;
};

export const pgpVerify = async (
  plainText: string,
  signature: string,
  publicKeyArmored: string,
) => {
  return await OpenPGP.verify(signature, plainText, publicKeyArmored);
};
