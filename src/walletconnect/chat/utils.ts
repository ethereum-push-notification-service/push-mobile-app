import {IProvider} from '@walletconnect/modal-react-native';
import {ethers} from 'ethers';

// import ENV_CONFIG from 'src/env.config';

export const getSigner = async (
  wcProvider: IProvider,
): Promise<[ethers.providers.JsonRpcSigner, string]> => {
  const provider = wcProvider;
  const ethers_provider = new ethers.providers.Web3Provider(provider);
  const signer = ethers_provider.getSigner();

  const account = await signer.getAddress();

  return [signer, account];
};

export const walletToPCAIP10 = (account: string): string => {
  if (account.includes('eip155:')) {
    return account;
  }
  return 'eip155:' + account;
};

export const pCAIP10ToWallet = (wallet: string): string => {
  wallet = wallet.replace('eip155:', '');
  return wallet;
};

export const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
};

export const getRandomValues = async (array: Uint8Array) => {
  // @ts-ignore
  return crypto.getRandomValues(array);
};

export const bytesToHex = (bytes: Uint8Array): string => {
  return bytes.reduce(
    (str, byte) => str + byte.toString(16).padStart(2, '0'),
    '',
  );
};
