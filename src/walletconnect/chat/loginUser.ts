import * as PushAPI from '@pushprotocol/restapi';
import {
  getSignature,
  getWallet,
} from '@pushprotocol/restapi/src/lib/chat/helpers';
import Constants from '@pushprotocol/restapi/src/lib/constants';
import WalletConnect from '@walletconnect/client';
import * as PushNodeClient from 'src/apis';
import MetaStorage from 'src/singletons/MetaStorage';

import {decryptV2} from './aes';
import {createUser} from './createUser';
import {getSigner, hexToBytes, walletToPCAIP10} from './utils';

export const handleWalletConnectChatLogin = async (
  connector: WalletConnect,
) => {
  const [signer, account] = await getSigner(connector);
  const caipAddrs = walletToPCAIP10(account);
  const wallet = getWallet({account, signer});
  const address = account;

  const user = (await PushNodeClient.getUser(caipAddrs)) as PushAPI.IUser;

  // user is new
  // create the pgp pair
  if (!user || !user.publicKey) {
    const [success, privKey] = await createUser(connector);
    if (success) {
      await MetaStorage.instance.setUserChatData({
        pgpPrivateKey: privKey,
        encryptionPublicKey: '',
      });
      return true;
    } else {
      return false;
    }
  }
  // Get the private key for the v2
  if (user.encryptionType === Constants.ENC_TYPE_V2) {
    const {preKey: input} = JSON.parse(user.encryptedPrivateKey);
    const enableProfileMessage = 'Enable Push Chat Profile \n' + input;
    const {verificationProof: secret} = await getSignature(
      address,
      wallet,
      enableProfileMessage,
      false,
    );

    const encodedPrivateKey = await decryptV2(
      JSON.parse(user.encryptedPrivateKey),
      hexToBytes(secret || ''),
    );
    const dec = new TextDecoder();
    const decryptedPrivateKey = dec.decode(encodedPrivateKey);
    await MetaStorage.instance.setUserChatData({
      pgpPrivateKey: decryptedPrivateKey,
      encryptionPublicKey: '',
    });
    return true;
  }

  return false;
};